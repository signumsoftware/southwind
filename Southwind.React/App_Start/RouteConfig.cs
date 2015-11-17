using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.WebHost;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.SessionState;
using Signum.React.PortableAreas;

namespace Southwind.React
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                 "EmbeddedResources",
                 "{*file}",
                 new { controller = "Resources", action = "GetFile" },
                 new { file = new EmbeddedFileExist() }
            );

            routes.MapRoute(
                name: "Default",
                url: "{*catchall}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }

   
}
