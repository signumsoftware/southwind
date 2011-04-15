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
            }
        }
    }
}
