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
using Signum.React.UserQueries;
using System.Globalization;
using System.Threading;
using Signum.Engine.Basics;
using Signum.React.Translation;
using Signum.React.Chart;
using Signum.React.Dashboard;
using Signum.React.Map;
using Signum.React.Cache;
using Signum.React.Scheduler;
using Signum.React.Processes;
using Signum.React.Mailing;
using Signum.React.Files;
using Signum.React.Word;
using Signum.React.Excel;
using Signum.React.Profiler;
using Signum.React.DiffLog;
using Signum.Engine.Translation;
using System.ServiceModel;
using System.ServiceModel.Channels;
using Signum.Engine.Processes;
using Signum.Engine.Scheduler;
using Signum.Engine.Mailing;
using Signum.React.Filters;
using System.Net.Http;
using Signum.React.Dynamic;
using Signum.Entities.Dynamic;
using Signum.React.Workflow;
using Signum.React.Toolbar;

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
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional },
                constraints: new { catchall = @"^(?!api).*" }
            );
        }

        void Application_Start(object sender, EventArgs e)
        {
            DynamicCode.CodeGenDirectory = Server.MapPath("~/CodeGen");
            Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));

            using (AuthLogic.Disable())
                Schema.Current.Initialize();

            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebStart);
            RegisterMvcRoutes(RouteTable.Routes);            

            Statics.SessionFactory = new ScopeSessionFactory(new VoidSessionFactory());

            ProcessRunnerLogic.StartRunningProcesses(5 * 1000);

            SchedulerLogic.StartScheduledTasks();

            AsyncEmailSenderLogic.StartRunningEmailSenderAsync(5 * 1000);
        }


        public static void WebStart(HttpConfiguration config)
        {
            SignumServer.Start(config, typeof(Global).Assembly);
            AuthServer.Start(config, () => Starter.Configuration.Value.AuthTokens, "IMPORTANT SECRET FROM Southwind. CHANGE THIS STRING!!!");
            CacheServer.Start(config);
            FilesServer.Start(config);
            UserQueryServer.Start(config);
            DashboardServer.Start(config);
            WordServer.Start(config);
            ExcelServer.Start(config);
            ChartServer.Start(config);
            MapServer.Start(config);
            ToolbarServer.Start(config);
            TranslationServer.Start(config, new AlreadyTranslatedTranslator(new AzureTranslator("Your API Key for Azure Translate")));
            SchedulerServer.Start(config);
            ProcessServer.Start(config);
            DisconnectedServer.Start(config);
            MailingServer.Start(config);
            ProfilerServer.Start(config);
            DiffLogServer.Start(config);
            WorkflowServer.Start(config);
            DynamicServer.Start(config);

            OmniboxServer.Start(config,
                new EntityOmniboxResultGenenerator(),
                new DynamicQueryOmniboxResultGenerator(),
                new ChartOmniboxResultGenerator(),
                new DashboardOmniboxResultGenerator(DashboardLogic.Autocomplete),
                new UserQueryOmniboxResultGenerator(UserQueryLogic.Autocomplete),
                new UserChartOmniboxResultGenerator(UserChartLogic.Autocomplete),
                new MapOmniboxResultGenerator(type => OperationLogic.TypeOperations(type).Any()),
                new ReactSpecialOmniboxGenerator()
                //new HelpModuleOmniboxResultGenerator(),
                );//Omnibox

            SignumAuthenticationAndProfilerAttribute.GetCurrentCultures = (ac) => CultureInfoUtils.ChangeBothCultures(GetCulture(ac.Request));
        }


        static CultureInfo DefaultCulture = CultureInfo.GetCultureInfo("en");

        private static CultureInfo GetCulture(HttpRequestMessage request)
        {
            // 1 cookie (temporary)
            var lang = TranslationServer.ReadLanguageCookie(request);
            if (lang != null )
                return CultureInfo.GetCultureInfo(lang);

            // 2 user preference
            if (UserEntity.Current?.CultureInfo != null)
                return UserEntity.Current.CultureInfo.ToCultureInfo();

            //3 requestCulture or default
            CultureInfo ciRequest = TranslationServer.GetCultureRequest(request);
            if (ciRequest != null)
                return ciRequest;

            return DefaultCulture; //Translation
        }
    }
}