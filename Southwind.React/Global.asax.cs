using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using Southwind.Logic;
using Signum.Engine;
using Southwind.React.Properties;
using Signum.React;
using Signum.Utilities;
using Signum.Engine.Maps;
using Signum.Engine.Authorization;
using Signum.React.Facades;
using Signum.Entities;
using Signum.Entities.Authorization;
using Southwind.Entities;
using Signum.React.Auth;
using System.Web.Http.Dispatcher;
using Signum.React.ApiControllers;
using System.Reflection;
using Signum.React.Authorization;
using Signum.Entities.Omnibox;
using Signum.Entities.Chart;
using Signum.Engine.Chart;
using Signum.Entities.Dashboard;
using Signum.Engine.Dashboard;
using Signum.Entities.UserQueries;
using Signum.Engine.UserQueries;
using Signum.Entities.Help;
using Signum.React.Omnibox;
using Signum.Entities.Map;
using Signum.Engine.Operations;

namespace Southwind.React
{
    public class Global : HttpApplication
    {
        public static void RegisterMvcRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{*catchall}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }

        void Application_Start(object sender, EventArgs e)
        {
            Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));

            using (AuthLogic.Disable())
                Schema.Current.Initialize();

            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebStart);
            RegisterMvcRoutes(RouteTable.Routes);            

            Statics.SessionFactory = new WebApiSesionFactory();
        }


        public static void WebStart(HttpConfiguration config)
        {
            SignumServer.Start(config, typeof(Global).Assembly);
            AuthServer.Start(config, queries: true, types: true);
            OmniboxServer.Start(config,
                new EntityOmniboxResultGenenerator(),
                new DynamicQueryOmniboxResultGenerator()
                //new ChartOmniboxResultGenerator(),
                //new DashboardOmniboxResultGenerator(DashboardLogic.Autocomplete),
                //new UserQueryOmniboxResultGenerator(UserQueryLogic.Autocomplete),
                //new UserChartOmniboxResultGenerator(UserChartLogic.Autocomplete),
                //new MapOmniboxResultGenerator(type => OperationLogic.TypeOperations(type).Any()),
                //new HelpModuleOmniboxResultGenerator(),
                //ReactSpecialOmniboxGenerator.Singletone
                );
            
        }

        protected void Application_PostAuthorizeRequest()
        {
            HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required);
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            UserTicketServer.LoginFromCookie();
        }
    }
}