using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Southwind.Logic;
using Schema = Signum.Engine.Maps.Schema;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Net;
using Signum.API.Filters;
using Signum.API;
using Signum.Rest;
using Signum.Dynamic;
using Signum.Authorization;
using Signum.Alerts;
using Signum.ConcurrentUser;
using Signum.Processes;
using Signum.Scheduler;
using Signum.Mailing;
using Signum.Cache;
using Signum.Files;
using Signum.UserQueries;
using Signum.Dashboard;
using Signum.Word;
using Signum.Excel;
using Signum.Chart;
using Signum.Map;
using Signum.Toolbar;
using Signum.Translation;
using Signum.Translation.Translators;
using Signum.Profiler;
using Signum.DiffLog;
using Signum.MachineLearning;
using Signum.Workflow;
using Signum.Omnibox;
using Southwind.Public;
using Microsoft.AspNetCore.Mvc;
using Signum.Chart.UserChart;

namespace Southwind.React;

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
                        Schema = context.SchemaGenerator.GenerateSchema(typeof(HttpError), context.SchemaRepository)
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
        services.AddResponseCompression();
        
        services
            .AddMvc(options => options.AddSignumGlobalFilters())
            .AddApplicationPart(typeof(SignumServer).Assembly)
            .AddApplicationPart(typeof(AuthServer).Assembly)
            .AddJsonOptions(options => options.AddSignumJsonConverters());
        services.AddSignalR();
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

            string headerName = RestApiKeyLogic.ApiKeyHeader;

            c.AddSecurityDefinition(headerName, new OpenApiSecurityScheme
            {
                Description = $"Api key needed to access the endpoints. {headerName}: My_API_Key",
                In = ParameterLocation.Header,
                Name = headerName,
                Type = SecuritySchemeType.ApiKey
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Name = headerName,
                        Type = SecuritySchemeType.ApiKey,
                        In = ParameterLocation.Header,
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = headerName
                        },
                     },
                     new string[] {}
                 }
            });

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
            DynamicLogic.CodeGenDirectory = env.ContentRootPath + "/CodeGen";

            Starter.Start(
                Configuration.GetConnectionString("ConnectionString")!,
                Configuration.GetValue<bool>("IsPostgres"),
                Configuration.GetConnectionString("AzureStorageConnectionString"),
                Configuration.GetValue<string>("BroadcastSecret"),
                Configuration.GetValue<string>("BroadcastUrls"),
                wsb: new WebServerBuilder
                {
                    ApplicationBuilder = app,
                    ApplicationLifetime = lifetime,
                    WebHostEnvironment = env,
                    AuthTokenEncryptionKey = "IMPORTANT SECRET FROM Southwind. CHANGE THIS STRING!!!",
                    MachineName = Configuration.GetValue<string?>("ServerName"),
                    DefaultCulture = CultureInfo.GetCultureInfo("en")
                });

            Statics.SessionFactory = new ScopeSessionFactory(new VoidSessionFactory());

            log.Switch("UseEndpoints");

            //Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("../swagger/v1/swagger.json", "Southwind API");
            });//Swagger Configure

            app.UseWhen(req => req.Request.Path.StartsWithSegments("/api/reflection/types"), builder =>
            {
                builder.UseResponseCompression();
            });

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                AlertsServer.MapAlertsHub(endpoints);
                ConcurrentUserServer.MapConcurrentUserHub(endpoints);
                endpoints.MapControllers();
                endpoints.MapControllerRoute(
                    name: "spa-fallback",
                    pattern: "{*url}",
                    constraints: new { url = new NoAPIContraint() },
                    defaults: new { controller = "Home", action = "Index" });
            });
        }

        SignumInitializeFilterAttribute.InitializeDatabase = () =>
        {
            using (HeavyProfiler.Log("Startup"))
            using (var log = HeavyProfiler.Log("Initial"))
            {
                log.Switch("Initialize");
                using (AuthLogic.Disable())
                    Schema.Current.Initialize();

                if (Configuration.GetValue<bool>("StartBackgroundProcesses"))
                {
                    log.Switch("StartRunningProcesses");
                    ProcessRunner.StartRunningProcessesAfter(5 * 1000);

                    log.Switch("StartScheduledTasks");
                    ScheduleTaskRunner.StartScheduledTaskAfter(5 * 1000);

                    log.Switch("StartRunningEmailSenderAsync");
                    AsyncEmailSender.StartAsyncEmailSenderAfter(5 * 1000);
                }

                SystemEventServer.LogStartStop(app, lifetime);
                
            }
        };
    }

    class NoAPIContraint : IRouteConstraint
    {
        public bool Match(HttpContext? httpContext, IRouter? route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
        {
            var url = (string?)values[routeKey];

            if (url != null && url.StartsWith("api/"))
                return false;

            return true;
        }
    }
}
