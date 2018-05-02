using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
//using Signum.Engine;
//using Signum.Engine.Authorization;
//using Signum.Engine.Basics;
//using Signum.Engine.Chart;
//using Signum.Engine.Dashboard;
//using Signum.Engine.Mailing;
//using Signum.Engine.Maps;
//using Signum.Engine.Operations;
//using Signum.Engine.Processes;
//using Signum.Engine.Scheduler;
//using Signum.Engine.Translation;
//using Signum.Engine.UserQueries;
//using Signum.Entities.Authorization;
//using Signum.Entities.Chart;
//using Signum.Entities.Dashboard;
//using Signum.Entities.Dynamic;
//using Signum.Entities.Map;
//using Signum.Entities.Omnibox;
//using Signum.Entities.UserQueries;
//using Signum.React.Authorization;
//using Signum.React.Cache;
//using Signum.React.Chart;
//using Signum.React.Dashboard;
//using Signum.React.DiffLog;
//using Signum.React.Dynamic;
//using Signum.React.Excel;
//using Signum.React.Facades;
//using Signum.React.Files;
//using Signum.React.Filters;
//using Signum.React.MachineLearning;
//using Signum.React.Mailing;
//using Signum.React.Map;
//using Signum.React.Omnibox;
//using Signum.React.Processes;
//using Signum.React.Profiler;
//using Signum.React.Scheduler;
//using Signum.React.Toolbar;
//using Signum.React.Translation;
//using Signum.React.UserQueries;
//using Signum.React.Word;
//using Signum.React.Workflow;
//using Signum.Utilities;
//using Southwind.Logic;

namespace WebApplication2
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
                //.AddJsonOptions(options => options.AddSignumJsonConverters());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime liveTime)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true,
                    ReactHotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });

            //VersionFilterAttribute.CurrentVersion = Assembly.GetExecutingAssembly().GetName().Version.ToString();

            //DynamicCode.CodeGenDirectory = env.WebRootPath + "/CodeGen";
            //Starter.Start(UserConnections.Replace(Configuration.GetConnectionString("ConnectionString")), Configuration.GetSection("Environment").Value);

            //using (AuthLogic.Disable())
            //    Schema.Current.Initialize();
            
            //Statics.SessionFactory = new ScopeSessionFactory(new VoidSessionFactory());

            //ProcessRunnerLogic.StartRunningProcesses(5 * 1000);

            //SchedulerLogic.StartScheduledTasks();

            //AsyncEmailSenderLogic.StartRunningEmailSenderAsync(5 * 1000);
        }

        //public static void WebStart(IApplicationBuilder config, IApplicationLifetime lifetime)
        //{
           
        //    AuthServer.Start(config, () => Starter.Configuration.Value.AuthTokens, "IMPORTANT SECRET FROM Southwind. CHANGE THIS STRING!!!");
        //    CacheServer.Start(config);
        //    FilesServer.Start(config);
        //    UserQueryServer.Start(config);
        //    DashboardServer.Start(config);
        //    WordServer.Start(config);
        //    ExcelServer.Start(config);
        //    ChartServer.Start(config);
        //    MapServer.Start(config);
        //    ToolbarServer.Start(config);
        //    TranslationServer.Start(config, new AlreadyTranslatedTranslator(new AzureTranslator("Your API Key for Azure Translate")));
        //    SchedulerServer.Start(config, lifetime);
        //    ProcessServer.Start(config);
        //    DisconnectedServer.Start(config);
        //    MailingServer.Start(config);
        //    ProfilerServer.Start(config);
        //    DiffLogServer.Start(config);
        //    PredictorServer.Start(config);
        //    WorkflowServer.Start(config);
        //    DynamicServer.Start(config);

        //    OmniboxServer.Start(config,
        //        new EntityOmniboxResultGenenerator(),
        //        new DynamicQueryOmniboxResultGenerator(),
        //        new ChartOmniboxResultGenerator(),
        //        new DashboardOmniboxResultGenerator(DashboardLogic.Autocomplete),
        //        new UserQueryOmniboxResultGenerator(UserQueryLogic.Autocomplete),
        //        new UserChartOmniboxResultGenerator(UserChartLogic.Autocomplete),
        //        new MapOmniboxResultGenerator(type => OperationLogic.TypeOperations(type).Any()),
        //        new ReactSpecialOmniboxGenerator()
        //        //new HelpModuleOmniboxResultGenerator(),
        //        );//Omnibox

        //    //SignumAuthenticationFilterAttribute.GetCurrentCultures = (ac) => GetCulture(ac.Request);
        //}


        //static CultureInfo DefaultCulture = CultureInfo.GetCultureInfo("en");

        //private static CultureInfo GetCulture(ActionContext actionContext)
        //{
        //    // 1 cookie (temporary)
        //    var lang = TranslationServer.ReadLanguageCookie(actionContext);
        //    if (lang != null)
        //        return CultureInfo.GetCultureInfo(lang);

        //    // 2 user preference
        //    if (UserEntity.Current?.CultureInfo != null)
        //        return UserEntity.Current.CultureInfo.ToCultureInfo();

        //    //3 requestCulture or default
        //    CultureInfo ciRequest = TranslationServer.GetCultureRequest(actionContext);
        //    if (ciRequest != null)
        //        return ciRequest;

        //    return DefaultCulture; //Translation
        //}
    }
}
