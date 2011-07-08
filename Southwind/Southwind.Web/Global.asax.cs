using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Southwind.Logic;
using Signum.Engine;
using Southwind.Web.Properties;
using Signum.Engine.Maps;
using Signum.Web;
using Signum.Web.PortableAreas;
using Signum.Engine.Authorization;
using Signum.Web.Auth;
using Signum.Web.AuthAdmin;
using Signum.Web.Operations;
using Signum.Entities.Authorization;
using System.Threading;
using Signum.Web.Queries;
using Signum.Web.Reports;
using Signum.Utilities;
using System.Globalization;

namespace Southwind.Web
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
             Navigator.ViewRouteName,
             "View/{webTypeName}/{id}",
             new { controller = "Signum", action = "View", webTypeName = "", id = "" }
          );

            routes.MapRoute(
                Navigator.FindRouteName,
                "Find/{webQueryName}",
                new { controller = "Signum", action = "Find", webQueryName = "" }
            );

            RouteTable.Routes.MapRoute(
                 "EmbeddedResources",
                 "{*file}",
                 new { controller = "Resources", action = "GetFile" },
                 new { file = new EmbeddedFileExist() }
            );

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );
        }

        protected void Application_Start()
        {
            Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));

            using (AuthLogic.Disable())
                Schema.Current.Initialize();

            WebStart();

            RegisterRoutes(RouteTable.Routes);
        }

        private void WebStart()
        {
            Navigator.Start(new NavigationManager());
            Constructor.Start(new ConstructorManager());

            OperationsClient.Start(new OperationManager(), true);

            AuthClient.Start(true, true, true, true, false);
            AuthAdminClient.Start(true, true, true, true, true, true, true);

            UserQueriesClient.Start();
            ReportsClient.Start(true, false);            

            SouthwindClient.Start();            

            ScriptHtmlHelper.Manager.MainAssembly = typeof(SouthwindClient).Assembly;
            SignumControllerFactory.MainAssembly = typeof(SouthwindClient).Assembly;

            SignumControllerFactory.EveryController().AddFilters(ctx =>
              ctx.FilterInfo.AuthorizationFilters.OfType<AuthenticationRequiredAttribute>().Any() ? null : new AuthenticationRequiredAttribute());

            SignumControllerFactory.EveryController().AddFilters(new SignumExceptionHandlerAttribute());

            Navigator.Initialize();
        }

        protected void Application_AcquireRequestState(object sender, EventArgs e)
        {
            UserDN user = HttpContext.Current.Session == null ? null :
                (UserDN)HttpContext.Current.Session[AuthController.SessionUserKey];

            if (user != null)
                Thread.CurrentPrincipal = user;

            Sync.ChangeBothCultures(new CultureInfo("en-US"));
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            SignumExceptionHandlerAttribute.HandlerApplication_Error(HttpContext.Current, true);
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            AuthController.LoginFromCookie();
        }

        protected void Application_ReleaseRequestState(object sender, EventArgs e)
        {
            Thread.CurrentPrincipal = null;
        }
    }
}
