using Signum.Engine;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Maps;
using Signum.Engine.Operations;
using Southwind.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Southwind.Logic
{
    public static class ShipperLogic
    {
        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<ShipperDN>();

                dqm.RegisterQuery(typeof(ShipperDN), () =>
                    from a in Database.Query<ShipperDN>()
                    select new
                    {
                        Entity = a,
                        a.Id,
                        a.CompanyName,
                        a.Phone
                    });

                new BasicExecute<ShipperDN>(ShipperOperations.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();
            }
        }
    }
}
