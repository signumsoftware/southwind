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

namespace Southwind.React
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));

            using (AuthLogic.Disable())
                Schema.Current.Initialize();

            ReflectionCache.Start();

            Statics.SessionFactory = new WebApiSesionFactory();
        }

        protected void Application_PostAuthorizeRequest()
        {
            System.Web.HttpContext.Current.SetSessionStateBehavior(System.Web.SessionState.SessionStateBehavior.Required);
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            UserTicketClient.LoginFromCookie();
        }
    }
}