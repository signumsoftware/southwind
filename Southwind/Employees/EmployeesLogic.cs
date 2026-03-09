using DocumentFormat.OpenXml.ExtendedProperties;
using Pgvector;
using Signum.Agent;
using Signum.Authorization;
using Signum.Engine;
using Signum.Utilities.Synchronization;
using Southwind.Globals;
using Southwind.Orders;

namespace Southwind.Employees;

public static class EmployeesLogic
{
    [AutoExpressionField]
    public static IQueryable<TerritoryEntity> Territories(this RegionEntity r) =>
        As.Expression(() => Database.Query<TerritoryEntity>().Where(a => a.Region.Is(r)));

    public static void Start(SchemaBuilder sb)
    {
        if (sb.AlreadyDefined(MethodInfo.GetCurrentMethod()))
            return;

        sb.Include<EmployeeEntity>()
            .WithSave(EmployeeOperation.Save, (e, args) =>
            {
                if (Connector.Current.SupportsVectors)
                    GeneratePassages(e, null);
            })
            .WithFullTextIndex(a => new { a.FirstName, a.LastName, a.Notes })
            .WithQuery(() => e => new
            {
                Entity = e,
                e.Id,
                e.FirstName,
                e.LastName,
                e.BirthDate,
                e.Photo, //1
            });


        Lite.RegisterLiteModelConstructor((EmployeeEntity e) => new EmployeeLiteModel
        {
            FirstName = e.FirstName,
            LastName = e.LastName,
            Photo = e.Photo,
        });

        UserWithClaims.FillClaims += (userWithClaims, user) =>
        {
            userWithClaims.Claims["Employee"] = ((UserEntity)user).Mixin<UserEmployeeMixin>().Employee;
        };

        QueryLogic.Queries.Register(EmployeeQuery.EmployeesByTerritory, () =>
            from e in Database.Query<EmployeeEntity>()
            from t in e.Territories
            select new
            {
                Entity = e,
                e.Id,
                e.FirstName,
                e.LastName,
                e.BirthDate,
                e.Photo, //2
                Territory = t,
            });

        sb.Include<RegionEntity>()
            .WithSave(RegionOperation.Save)
            .WithQuery(() => r => new
            {
                Entity = r,
                r.Id,
                r.Description,
            });

        sb.Include<TerritoryEntity>()
            .WithSave(TerritoryOperation.Save)
            .WithExpressionFrom((RegionEntity r) => r.Territories())
            .WithQuery(() => t => new
            {
                Entity = t,
                t.Id,
                t.Description,
                t.Region
            });

        if (Connector.Current.SupportsVectors)
        {
            sb.Include<EmployeePassageEntity>()
                .WithVectorIndex(a => a.Embedding, vti =>
                {
                    if (Connector.Current is SqlServerConnector)
                        vti.DelayCreation = true;
                })
                .WithQuery(() => ep => new
                {
                    Entity = ep,
                    ep.Id,
                    ep.Employee,
                    ep.Chunk,
                    ep.Index,
                    ep.IsTitle
                });

        } //SupportsVectors
    }

    public static void Create(EmployeeEntity employee)
    {
        if (!employee.IsNew)
            throw new ArgumentException("The employee should be new", "employee");

        employee.Save();
    }

    public static List<Lite<EmployeeEntity>> TopEmployees(int num)
    {
        return (from e in Database.Query<EmployeeEntity>()
                orderby Database.Query<OrderEntity>().Count(a => a.Employee.Is(e.ToLite()))
                select e.ToLite()).Take(num).ToList();
    }

    public static void GeneratePassages(EmployeeEntity employee, Dictionary<string, float[]>? dic)
    {
        if (!Schema.Current.Tables.ContainsKey(typeof(EmployeePassageEntity)))
            return;

        if (!employee.IsNew)
            Database.Query<EmployeePassageEntity>().Where(a => a.Employee.Is(employee)).UnsafeDelete();

        var passages = new List<EmployeePassageEntity>
        {
            new EmployeePassageEntity
            {
                Employee = employee.ToLite(),
                IsTitle = true,
                Chunk = employee.TitleOfCourtesy.HasText()
                ? $"{employee.TitleOfCourtesy} {employee.FirstName} {employee.LastName} works as {employee.Title ?? "Employee"}"
                : $"{employee.FirstName} {employee.LastName} works as {employee.Title ?? "Employee"}",
                Index = 0
            }
        };

        if (employee.Notes.HasText())
        {
            passages.AddRange(employee.Notes.SplitNoEmpty('\r', '\n', '.')
                .Select(t => t.Trim())
                .Where(t => t.HasText())
                .Select((chunk, index) => new EmployeePassageEntity
                {
                    Employee = employee.ToLite(),
                    IsTitle = false,
                    Chunk = chunk,
                    Index = index
                }));
        }

        if (dic != null)
        {
            passages.ForEach(a => a.Embedding = new Vector(dic.GetOrThrow(a.Chunk)));
        }
        else
        {
            var model = ChatbotLogic.DefaultEmbeddingsModel.Value!.RetrieveFromCache();
            var embeddings = model.GetEmbeddingsAsync(passages.Select(a => a.Chunk).ToArray(), default).ResultSafe();
            passages.ForEach((a, i) => a.Embedding = new Vector(embeddings[i]));
        }

        passages.BulkInsert();
    } //GeneratePassages
}
