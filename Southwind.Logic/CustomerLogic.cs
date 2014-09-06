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
                .ColumnProperyRoutes(a => a.Id, 
                    PropertyRoute.Construct((PersonDN comp) => comp.Id), 
                    PropertyRoute.Construct((CompanyDN p) => p.Id))
                .ColumnProperyRoutes(a => a.Name, 
                    PropertyRoute.Construct((PersonDN comp) => comp.FirstName), 
                    PropertyRoute.Construct((PersonDN comp) => comp.LastName), 
                    PropertyRoute.Construct((CompanyDN p) => p.CompanyName))
                .ColumnProperyRoutes(a => a.Address, 
                    PropertyRoute.Construct((PersonDN comp) => comp.Address), 
                    PropertyRoute.Construct((PersonDN comp) => comp.Address))
                .ColumnProperyRoutes(a => a.Phone, 
                    PropertyRoute.Construct((PersonDN comp) => comp.Phone), 
                    PropertyRoute.Construct((CompanyDN p) => p.Phone))
                .ColumnProperyRoutes(a => a.Fax, 
                    PropertyRoute.Construct((PersonDN comp) => comp.Fax), 
                    PropertyRoute.Construct((CompanyDN p) => p.Fax))
                , entityImplementations: Implementations.By(typeof(PersonDN), typeof(CompanyDN)));

                dqm.RegisterExpression((CustomerDN c) => c.Address).ForcePropertyRoute = PropertyRoute.Construct((PersonDN p) => p.Address);
                dqm.RegisterExpression((CustomerDN c) => c.Phone).ForcePropertyRoute = PropertyRoute.Construct((PersonDN p) => p.Address);
                dqm.RegisterExpression((CustomerDN c) => c.Fax).ForcePropertyRoute = PropertyRoute.Construct((PersonDN p) => p.Address);

            }
        }
    }
}
