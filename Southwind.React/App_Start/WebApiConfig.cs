using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using System.Web.Http.WebHost;
using System.Web.Routing;
using System.Web.SessionState;
using Signum.React;
using Signum.Utilities;
using Signum.React.Json;
using Newtonsoft.Json.Converters;

namespace Southwind.React
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            var appXmlType = config.Formatters.XmlFormatter.SupportedMediaTypes.FirstOrDefault(t => t.MediaType == "application/xml");
            config.Formatters.XmlFormatter.SupportedMediaTypes.Remove(appXmlType);

            //Signum converters
            config.Formatters.JsonFormatter.SerializerSettings.Do(s =>
            {
                s.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                s.Formatting = Newtonsoft.Json.Formatting.Indented;
                s.Converters.Add(new LiteJsonConverter());
                s.Converters.Add(new EntityJsonConverter());
                s.Converters.Add(new StringEnumConverter());
            });


            // Web API routes
            config.MapHttpAttributeRoutes();

            RouteTable.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            ).RouteHandler = new SessionRouteHandler();
        }
    }

}
