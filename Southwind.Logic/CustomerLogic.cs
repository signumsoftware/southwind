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
using Signum.Engine.Operations;

namespace Southwind.Logic
{
    public static class CustomerLogic
    {
        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Settings.OverrideAttributes((OrderDN o) => o.Customer,
                    new ImplementedByAttribute(typeof(CompanyDN), typeof(PersonDN)));

                sb.Include<PersonDN>();
                sb.Include<CompanyDN>();

                dqm.RegisterQuery(typeof(PersonDN), () =>
                    from r in Database.Query<PersonDN>()
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
                    });

                dqm.RegisterQuery(typeof(CompanyDN), () =>
                    from r in Database.Query<CompanyDN>()
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
                    });

                new Graph<CustomerDN>.Execute(CustomerOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();

                new Graph<CompanyDN>.Execute(CustomerOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.RegisterReplace();

                new Graph<PersonDN>.Execute(CustomerOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.RegisterReplace();

                dqm.RegisterQuery(typeof(CustomerDN), () => DynamicQuery.Manual((QueryRequest request, QueryDescription descriptions) =>
                {
                    var persons = Database.Query<PersonDN>().Select(p => new
                    {
                        Entity = p.ToLite<CustomerDN>(),
                        Id = "P " + p.Id,
                        Name = p.FirstName + " " + p.LastName,
                        p.Address,
                        p.Phone,
                        p.Fax
                    }).ToDQueryable(descriptions).AllQueryOperations(request);

                    var companies = Database.Query<CompanyDN>().Select(p => new
                    {
                        Entity = p.ToLite<CustomerDN>(),
                        Id = "C " + p.Id,
                        Name = p.CompanyName,
                        p.Address,
                        p.Phone,
                        p.Fax
                    }).ToDQueryable(descriptions).AllQueryOperations(request);

                    return persons.Concat(companies)
                        .OrderBy(request.Orders)
                        .TryPaginate(request.Pagination);

                })
                .Column(a => a.Id, c => { c.OverrideIsAllowed = () => null; })
                .Column(a => a.Name, c => { c.OverrideIsAllowed = () => null; })
                .Column(a => a.Address, c => { c.OverrideIsAllowed = () => null; c.PropertyRoutes = new[] { PropertyRoute.Construct((CompanyDN comp) => comp.Address) }; })
                .Column(a => a.Phone, c => { c.OverrideIsAllowed = () => null; })
                .Column(a => a.Fax, c => { c.OverrideIsAllowed = () => null; })
                , entityImplementations: Implementations.By(typeof(PersonDN), typeof(CompanyDN)));
            }
        }
    }
}
