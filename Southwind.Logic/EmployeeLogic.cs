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

        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<EmployeeEntity>();

                dqm.RegisterQuery(typeof(RegionEntity), () =>
                    from r in Database.Query<RegionEntity>()
                    select new
                    {
                        Entity = r,
                        r.Id,
                        r.Description,
                    });

                dqm.RegisterExpression((RegionEntity r) => r.Territories(), () => typeof(TerritoryEntity).NiceName());

                dqm.RegisterQuery(typeof(TerritoryEntity), () =>
                    from t in Database.Query<TerritoryEntity>()
                    select new
                    {
                        Entity = t,
                        t.Id,
                        t.Description,
                        t.Region
                    });

                dqm.RegisterQuery(typeof(EmployeeEntity), () =>
                    from e in Database.Query<EmployeeEntity>()
                    select new
                    {
                        Entity = e,
                        e.Id,
                        e.FirstName,
                        e.LastName,
                        e.BirthDate,
                        e.Photo, //1
                    });

                dqm.RegisterQuery(EmployeeQuery.EmployeesByTerritory, () =>
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

                new Graph<EmployeeEntity>.Execute(EmployeeOperation.Save)
                {
                    Lite = false,
                    AllowsNew = true,
                    Execute = (e, _) => { }
                }.Register();

                new Graph<TerritoryEntity>.Execute(TerritoryOperation.Save)
                {
                    Lite = false,
                    AllowsNew = true,
                    Execute = (e, _) => { }
                }.Register();

                new Graph<RegionEntity>.Execute(RegionOperation.Save)
                {
                    Lite = false,
                    AllowsNew = true,
                    Execute = (e, _) => { }
                }.Register();
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
