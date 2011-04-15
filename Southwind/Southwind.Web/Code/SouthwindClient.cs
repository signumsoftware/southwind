using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using Signum.Web;
using Signum.Utilities;
using Southwind.Entities;

namespace Southwind.Web
{
    public static class SouthwindClient
    {
        public static string ViewPrefix = "~/Views/Southwind/{0}.cshtml";

        public static void Start()
        {
            if (Navigator.Manager.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                Navigator.AddSettings(new List<EntitySettings>
                {
                    new EntitySettings<MyEntityDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("MyEntity") },
                });
            }
        }
    }
}