using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Engine.Basics;
using Signum.Engine.Chart;
using Signum.Engine.Dashboard;
using Signum.Engine.Mailing;
using Signum.Engine.Maps;
using Signum.Engine.Operations;
using Signum.Engine.Processes;
using Signum.Engine.Scheduler;
using Signum.Engine.Translation;
using Signum.Engine.UserQueries;
using Signum.Entities.Authorization;
using Signum.Entities.Chart;
using Signum.Entities.Dashboard;
using Signum.Entities.Dynamic;
using Signum.Entities.Map;
using Signum.Entities.Omnibox;
using Signum.Entities.UserQueries;
using Signum.React;
using Signum.React.Authorization;
using Signum.React.Cache;
using Signum.React.Chart;
using Signum.React.Dashboard;
using Signum.React.DiffLog;
using Signum.React.Dynamic;
using Signum.React.Excel;
using Signum.React.Facades;
using Signum.React.Files;
using Signum.React.Filters;
using Signum.React.Json;
using Signum.React.MachineLearning;
using Signum.React.Mailing;
using Signum.React.Map;
using Signum.React.Omnibox;
using Signum.React.Processes;
using Signum.React.Profiler;
using Signum.React.Scheduler;
using Signum.React.Toolbar;
using Signum.React.Translation;
using Signum.React.UserQueries;
using Signum.React.Word;
using Signum.React.Workflow;
using Signum.Utilities;
using Southwind.Logic;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.Swagger;
using Schema = Signum.Engine.Maps.Schema;
using System.Net;
using Signum.React.JsonModelValidators;
using Microsoft.Extensions.Hosting;
using Signum.React.Rest;
using Signum.React.RestLog;
using Microsoft.OpenApi.Models;

namespace Southwind.React
{
    public class ErrorResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var authAttributes = context.MethodInfo.DeclaringType!.GetCustomAttributes(true)
                 .Union(context.MethodInfo.GetCustomAttributes(true))
                 .OfType<AllowAnonymousAttribute>();

            AddError(HttpStatusCode.BadRequest);
            if (!authAttributes.Any())
                AddError(HttpStatusCode.Unauthorized);
            AddError(HttpStatusCode.Forbidden);
            AddError(HttpStatusCode.InternalServerError);

            void AddError(HttpStatusCode code)
            {
                operation.Responses[((int)code).ToString()] = new OpenApiResponse
                {
                    Description = code.ToString(),
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = context.SchemaGenerator.GenerateSchema(typeof(Signum.React.Filters.HttpError), context.SchemaRepository)
                        }
                    }
                };
            }
        }
    }

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class IncludeInDocumentationAttribute : Attribute
    {
    } //Swagger Attributes

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
            services
                .AddMvc(options => options.AddSignumGlobalFilters())
                .AddApplicationPart(typeof(SignumServer).Assembly)
                .AddApplicationPart(typeof(AuthServer).Assembly)
                .AddNewtonsoftJson(options => options.AddSignumJsonConverters())
                .ConfigureApplicationPartManager(apm =>
                {
                    apm.FeatureProviders.Add(new SignumControllerFactory(typeof(Startup).Assembly));
                });
            services.AddSignumValidation();
            services.Configure<IISServerOptions>(a => a.AllowSynchronousIO = true); //JSon.Net requires it

            //https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-2.1&tabs=visual-studio%2Cvisual-studio-xml
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Southwind API",
                    Version = "v1",
                    Description = @"Welcome to the Southwind API, which allows you to seamlessly integrate Southwind with your application.

### <a name=""authentication""></a> Authentication
This API is secured by an API Key.The API Key has either to be sent in the `X-ApiKey` HTTP Header:

```
GET http://localhost/Southwind.React/api/resource
X-ApiKey: YOUR_API_KEY
```

or as the `apiKey` query parameter:

```
GET http://localhost/Southwind.React/api/resource?apiKey=YOUR_API_KEY
```",
                });

                var scheme = new OpenApiSecurityScheme { In = ParameterLocation.Header, Description = "Use the API Key provided", Name = "X-ApiKey", Type = SecuritySchemeType.ApiKey };
                c.AddSecurityDefinition("Bearer", scheme);
                c.AddSecurityRequirement(new OpenApiSecurityRequirement { { scheme, new List<string>() } });

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                c.DocInclusionPredicate((docName, apiDesc) => apiDesc.TryGetMethodInfo(out var mi) && mi.DeclaringType!.HasAttribute<IncludeInDocumentationAttribute>());
                c.OperationFilter<ErrorResponsesOperationFilter>();
            }); //Swagger Services
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IHostApplicationLifetime lifetime)
        {
            app.UseDeveloperExceptionPage();

            app.UseStaticFiles();

            //HeavyProfiler.Enabled = true;
            using (HeavyProfiler.Log("Startup"))
            using (var log = HeavyProfiler.Log("Initial"))
            {
                DynamicCode.CodeGenDirectory = env.ContentRootPath + "/CodeGen";

                Starter.Start(Configuration.GetConnectionString("ConnectionString"), Configuration.GetValue<bool>("IsPostgres"));

                log.Switch("Initialize");
                using (AuthLogic.Disable())
                    Schema.Current.Initialize();

                Statics.SessionFactory = new ScopeSessionFactory(new VoidSessionFactory());

                log.Switch("WebStart");
                WebStart(app, env, lifetime);

                log.Switch("UseEndpoints");

                //Enable middleware to serve generated Swagger as a JSON endpoint.
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("../swagger/v1/swagger.json", "Southwind API");
                });//Swagger Configure

                app.UseRouting();
                app.UseEndpoints(routes =>
                {
                    routes.MapControllerRoute(
                        name: "default",
                        pattern: "{controller=Home}/{action=Index}/{id?}");
                });

                app.MapWhen(x => !x.Request.Path.Value.StartsWith("/api"), builder =>
                {
                    builder.UseRouting();
                    builder.UseEndpoints(routes =>
                    {
                        routes.MapControllerRoute(
                            name: "spa-fallback",
                            pattern: "{*url}",
                            defaults: new { controller = "Home", action = "Index" });
                    });
                });


                if (Configuration.GetValue<bool>("StartBackgroundProcesses"))
                {
                    log.Switch("StartRunningProcesses");
                    ProcessRunnerLogic.StartRunningProcesses(5 * 1000);

                    log.Switch("StartScheduledTasks");
                    SchedulerLogic.StartScheduledTasks();

                    log.Switch("StartRunningEmailSenderAsync");
                    AsyncEmailSenderLogic.StartRunningEmailSenderAsync(5 * 1000);
                }
            }
        }

        public static void WebStart(IApplicationBuilder app, IWebHostEnvironment env, IHostApplicationLifetime lifetime)
        {
            SignumServer.Start(app, env, typeof(Startup).Assembly);

            AuthServer.Start(app, () => Starter.Configuration.Value.AuthTokens, "IMPORTANT SECRET FROM Southwind. CHANGE THIS STRING!!!");
            CacheServer.Start(app);
            FilesServer.Start(app);
            UserQueryServer.Start(app);
            DashboardServer.Start(app);
            WordServer.Start(app);
            ExcelServer.Start(app);
            ChartServer.Start(app);
            MapServer.Start(app);
            ToolbarServer.Start(app);
            TranslationServer.Start(app, new AlreadyTranslatedTranslator(new AzureTranslator("Your API Key for Azure Translate")));
            SchedulerServer.Start(app, lifetime);
            ProcessServer.Start(app);
            MailingServer.Start(app);
            ProfilerServer.Start(app);
            DiffLogServer.Start(app);
            RestServer.Start(app);
            RestLogServer.Start(app);
            PredictorServer.Start(app);
            WorkflowServer.Start(app);
            DynamicServer.Start(app);

            OmniboxServer.Start(app,
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

            SignumCultureSelectorFilter.GetCurrentCulture = (ctx) => GetCulture(ctx);
        }

        static CultureInfo DefaultCulture = CultureInfo.GetCultureInfo("en");

        private static CultureInfo GetCulture(ActionContext context)
        {
            // 1 cookie (temporary)
            var lang = TranslationServer.ReadLanguageCookie(context);
            if (lang != null)
                return CultureInfo.GetCultureInfo(lang);

            // 2 user preference
            if (UserEntity.Current?.CultureInfo != null)
                return UserEntity.Current.CultureInfo!.ToCultureInfo();

            //3 requestCulture or default
            CultureInfo? ciRequest = TranslationServer.GetCultureRequest(context);
            if (ciRequest != null)
                return ciRequest;

            return DefaultCulture; //Translation
        }
    }
}
