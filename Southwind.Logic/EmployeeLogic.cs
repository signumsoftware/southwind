using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Engine.DynamicQuery;
using System.Reflection;
using Southwind.Entities;
using Signum.Engine;
using Signum.Utilities;
using Signum.Entities;
using Signum.Engine.Operations;
using Signum.Utilities.ExpressionTrees;
using System.Linq.Expressions;
using Signum.Engine.Basics;

namespace Southwind.Logic
{
    public static class EmployeeLogic
    {
        static Expression<Func<RegionEntity, IQueryable<TerritoryEntity>>> TerritoriesExpression =
            r => Database.Query<TerritoryEntity>().Where(a => a.Region == r);
        [ExpressionField]
        public static IQueryable<TerritoryEntity> Territories(this RegionEntity r)
        {
            return TerritoriesExpression.Evaluate(r);
        }

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
                    orderby Database.Query<OrderEntity>().Count(a => a.Employee == e.ToLite())
                    select e.ToLite()).Take(num).ToList();
        }
    }
}
