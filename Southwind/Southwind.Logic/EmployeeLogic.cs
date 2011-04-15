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

namespace Southwind.Logic
{
    public static class EmployeeLogic
    {
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
