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
using System.Linq.Expressions;
using Signum.Engine.Operations;

namespace Southwind.Logic
{
    public static class EmployeeLogic
    {
        static Expression<Func<RegionDN, IQueryable<TerritoryDN>>> TerritoriesExpression = 
            r => Database.Query<TerritoryDN>().Where(a=>a.Region == r); 
        public static IQueryable<TerritoryDN> Territories(this RegionDN r)
        {
            return TerritoriesExpression.Evaluate(r);
        }

        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<EmployeeDN>();

                dqm[typeof(RegionDN)] = (from r in Database.Query<RegionDN>()
                                         select new
                                         {
                                             Entity = r.ToLite(),
                                             r.Id,
                                             r.Description,
                                         }).ToDynamic();

                dqm.RegisterExpression((RegionDN r) => r.Territories()); 

                dqm[typeof(TerritoryDN)] = (from t in Database.Query<TerritoryDN>()
                                           select new
                                           {
                                               Entity = t.ToLite(),
                                               t.Id,
                                               t.Description,
                                               Region = t.Region.ToLite()
                                           }).ToDynamic();
                
                dqm[typeof(EmployeeDN)] = (from e in Database.Query<EmployeeDN>()
                                           select new
                                           {
                                               Entity = e.ToLite(),
                                               e.Id,
                                               e.FirstName,
                                               e.LastName,
                                               e.BirthDate,
                                               e.Photo,
                                           }).ToDynamic();

                dqm[EmployeeQueries.EmployeesByTerritory] = (from e in Database.Query<EmployeeDN>()
                                                             from t in e.Territories
                                                             select new
                                                             {
                                                                 Entity = e.ToLite(),
                                                                 e.Id,
                                                                 e.FirstName,
                                                                 e.LastName,
                                                                 e.BirthDate,
                                                                 e.Photo,
                                                                 Territory = t.ToLite(),
                                                             }).ToDynamic();

                new BasicExecute<EmployeeDN>(EmployeeOperation.Save)
                {
                    Lite = false,
                    AllowsNew = true,
                    Execute = (e, _) => { }
                }.Register();

                new BasicExecute<TerritoryDN>(TerritoryOperation.Save)
                {
                    Lite = false,
                    AllowsNew = true,
                    Execute = (e, _) => { }
                }.Register();

                new BasicExecute<RegionDN>(RegionOperation.Save)
                {
                    Lite = false,
                    AllowsNew = true,
                    Execute = (e, _) => { }
                }.Register();
            }
        }

        public static void Create(EmployeeDN employee)
        {
            if (!employee.IsNew)
                throw new ArgumentException("The employee should be new", "employee");

            employee.Save();
        }

        public static List<Lite<EmployeeDN>> TopEmployees(int num)
        {
            return (from e in Database.Query<EmployeeDN>()
                    orderby Database.Query<OrderDN>().Count(a => a.Employee == e.ToLite())
                    select e.ToLite()).Take(num).ToList();
        }
    }
}
