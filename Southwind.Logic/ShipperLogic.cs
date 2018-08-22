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
        public static void Start(SchemaBuilder sb)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<ShipperEntity>()
                    .WithSave(ShipperOperation.Save)
                    .WithQuery(() => a => new
                    {
                        Entity = a,
                        a.Id,
                        a.CompanyName,
                        a.Phone
                    });
            }
        }
    }
}
