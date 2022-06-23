using Signum.Entities.Authorization;
using Signum.Entities.Basics;
using Southwind.Entities;

namespace Southwind.Logic;

public static class EmployeeLogic
{
    [AutoExpressionField]
    public static IQueryable<TerritoryEntity> Territories(this RegionEntity r) =>
        As.Expression(() => Database.Query<TerritoryEntity>().Where(a => a.Region.Is(r)));

    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
        {
            sb.Include<EmployeeEntity>()
                .WithSave(EmployeeOperation.Save)
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
                PhotoPath = e.PhotoPath,
            });

            UserWithClaims.FillClaims += (userWithClaims, user)=>
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
        }
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
}
