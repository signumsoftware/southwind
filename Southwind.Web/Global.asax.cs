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
using Signum.Web.UserQueries;
using Signum.Web.Reports;
using Signum.Utilities;
using System.Globalization;
using Signum.Web.Chart;
using Signum.Web.ControlPanel;
using Signum.Web.Exceptions;
using Signum.Web.Omnibox;
using Signum.Web.Files;
using Signum.Web.Disconnected;
using Signum.Web.Processes;
using Signum.Engine.Processes;
using Signum.Entities.Basics;
using Signum.Web.Notes;
using Signum.Web.Alerts;
using Signum.Web.Profiler;
using Signum.Web.Cache;
using Southwind.Entities;
using Signum.Web.Mailing;

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
             Navigator.NavigateRouteName,
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
            Statics.SessionFactory = new ScopeSessionFactory(new AspNetSessionFactory());

            Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));

            using (AuthLogic.Disable())
                Schema.Current.Initialize();

            WebStart();

            ProcessRunnerLogic.StartRunningProcesses(5 * 1000);

            RegisterRoutes(RouteTable.Routes);

            AuthLogic.UserLogingIn += user =>
            {
                AllowLogin required = ScopeSessionFactory.IsOverriden ? AllowLogin.WindowsOnly : AllowLogin.WebOnly;

                AllowLogin current = user.Mixin<UserMixin>().AllowLogin; 

                if (current != AllowLogin.WindowsAndWeb && current != required)
                    throw new UnauthorizedAccessException("User {0} is {1}".Formato(user, current.NiceToString()));
            }; 
        }

        private void WebStart()
        {
            Navigator.Start(new NavigationManager());
            Constructor.Start(new ConstructorManager());

            OperationsClient.Start(new OperationManager(), true);

            AuthClient.Start(
                types: true, 
                property: true, 
                queries: true, 
                resetPassword: true, 
                passwordExpiration: false);

            Navigator.EntitySettings<UserDN>().ViewOverrides = new ViewOverrides()
                .AfterLine<UserDN>(u => u.Related, (html, tc) => html.ValueLine(tc, u => u.Mixin<UserMixin>().AllowLogin));

            AuthAdminClient.Start(
                types: true, 
                properties: true,
                queries: true, 
                operations: true,
                permissions: true);

            MailingClient.Start(
                newsletter: false, 
                pop3Config: true);

            SessionLogClient.Start();
            ExceptionClient.Start();
            UserQueriesClient.Start();
            FilesClient.Start(
                filePath: false, 
                file: true, 
                embeddedFile: false);
            ChartClient.Start();
            ReportsClient.Start(
                toExcelPlain:  true, 
                excelReport: false);
            ControlPanelClient.Start();

            DisconnectedClient.Start();
            ProcessesClient.Start(
                packages: true,
                packageOperations: true);

            NoteClient.Start();
            AlertClient.Start();
            LinksClient.Start(widget: true, contextualItems: true);

            SouthwindClient.Start();

            CacheClient.Start();

            ProfilerClient.Start();

            ScriptHtmlHelper.Manager.MainAssembly = typeof(SouthwindClient).Assembly;
            SignumControllerFactory.MainAssembly = typeof(SouthwindClient).Assembly;

            SignumControllerFactory.EveryController().AddFilters(ctx =>
              ctx.FilterInfo.AuthorizationFilters.OfType<AuthenticationRequiredAttribute>().Any() ? null : new AuthenticationRequiredAttribute());

            SignumControllerFactory.EveryController().AddFilters(new SignumExceptionHandlerAttribute());

            SignumControllerFactory.EveryController().AddFilters(new ProfilerFilterAttribute());

            Navigator.Initialize();

            OmniboxClient.Start();
            OmniboxClient.Register(new SpecialOmniboxProvider());
            OmniboxClient.Register(new EntityOmniboxProvider());
            OmniboxClient.Register(new DynamicQueryOmniboxProvider());
            OmniboxClient.Register(new UserQueriesOmniboxProvider());
            OmniboxClient.Register(new ChartOmniboxProvider());
            OmniboxClient.Register(new UserChartOmniboxProvider());

            ContextualItemsHelper.Start();
        }

        protected void Application_AcquireRequestState(object sender, EventArgs e)
        {
            Sync.ChangeBothCultures(new CultureInfo("en-US"));
        }

        protected void Application_Error(Object sender, EventArgs e)
        {
            SignumExceptionHandlerAttribute.HandlerApplication_Error(Request, HttpContext.Current, true);
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            AuthController.LoginFromCookie();
        }

        protected void Session_End(object sender, EventArgs e)
        {
            SessionLogClient.LogSessionEnd((UserDN)Session[UserHolder.UserSessionKey], TimeSpan.FromMinutes(Session.Timeout));
        }

        protected void Application_ReleaseRequestState(object sender, EventArgs e)
        {
            Statics.CleanThreadContextAndAssert();
        }
    }
}
