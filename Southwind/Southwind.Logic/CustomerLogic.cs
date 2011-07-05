using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Engine.DynamicQuery;
using System.Reflection;
using Southwind.Entities;
using Signum.Engine;
using Signum.Entities;
using Signum.Entities.DynamicQuery;

namespace Southwind.Logic
{
    public static class CustomerLogic
    {
        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Settings.OverrideFieldAttributes((OrderDN o) => o.Customer,
                    new ImplementedByAttribute(typeof(CompanyDN), typeof(PersonDN)));

                sb.Include<PersonDN>();
                sb.Include<CompanyDN>();

                dqm[typeof(PersonDN)] = (from r in Database.Query<PersonDN>()
                                         select new
                                         {
                                             Entity = r.ToLite(),
                                             r.Id,
                                             r.FirstName,
                                             r.LastName,
                                             r.DateOfBirth,
                                             r.Phone,
                                             r.Fax,
                                             r.Address,
                                         }).ToDynamic();

                dqm[typeof(CompanyDN)] = (from r in Database.Query<CompanyDN>()
                                          select new
                                          {
                                              Entity = r.ToLite(),
                                              r.Id,
                                              r.CompanyName,
                                              r.ContactName,
                                              r.ContactTitle,
                                              r.Phone,
                                              r.Fax,
                                              r.Address,
                                          }).ToDynamic();

                dqm[typeof(CustomerDN)] = DynamicQuery.Manual((QueryRequest request, List<ColumnDescription> descriptions) =>
                {
                    var persons = Database.Query<PersonDN>().Select(p => new
                    {
                        Entity = p.ToLite<CustomerDN>(),
                        Id = "P " + p.Id,
                        Name = p.FirstName + " " + p.LastName,
                        p.Address,
                        p.Phone,
                        p.Fax
                    }).ToDQueryable(descriptions)
                    .SelectMany(request.Multiplications)
                    .Where(request.Filters)
                    .Select(request.Columns)
                    .OrderBy(request.Orders)
                    .TryTake(request.Limit).ToArray();

                    var companies = Database.Query<CompanyDN>().Select(p => new
                    {
                        Entity = p.ToLite<CustomerDN>(),
                        Id = "C " + p.Id,
                        Name = p.CompanyName,
                        p.Address,
                        p.Phone,
                        p.Fax
                    }).ToDQueryable(descriptions)
                    .SelectMany(request.Multiplications)
                    .Where(request.Filters)
                    .Select(request.Columns)
                    .OrderBy(request.Orders)
                    .TryTake(request.Limit).ToArray();

                    return persons.Concat(companies).OrderBy(request.Orders).TryTake(request.Limit);
                }).Column(a => a.Entity, cd => cd.Implementations = new ImplementedByAttribute(typeof(PersonDN), typeof(CustomerDN)));
            }
        }
    }
}
