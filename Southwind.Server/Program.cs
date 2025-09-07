using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using ModelContextProtocol.Server;
using Signum.API;
using Signum.API.Filters;
using Signum.Authorization;
using Signum.Basics;
using Signum.Chatbot;
using Signum.Chatbot.Agents;
using Signum.Dynamic;
using Signum.Engine.Maps;
using Signum.Mailing;
using Signum.Processes;
using Signum.Rest;
using Signum.Scheduler;
using Signum.Security;
using Signum.Utilities;
using Southwind.ChatbotSkills;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Security.Authentication;

namespace Southwind.Server;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Configuration.AddUserSecrets(typeof(Program).Assembly);
        builder.Services.AddResponseCompression();
        
        builder.Services
            .AddMvc(options => options.AddSignumGlobalFilters())
            //.AddApplicationPart(typeof(SignumServer).Assembly)
            //.AddApplicationPart(typeof(AuthServer).Assembly)
            .AddJsonOptions(options => options.AddSignumJsonConverters());
        builder.Services.AddSignalR();
        builder.Services.AddSignumValidation();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("HealthCheck", builder =>
            {
                builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyHeader();
            });
        });

        //builder.Services.AddMcpServer().WithSignumSkill(new IntroductionSkill()
        //    .WithSubSkill(SkillActivation.Eager, new OrdersSkill().Register()));

        //https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-2.1&tabs=visual-studio%2Cvisual-studio-xml
        SwaggerConfig.ConfigureSwaggerService(builder);
        
        builder.Logging.AddProvider(new McpExceptionLoggerProvider());
        builder.Services.AddMcpServer()
            .WithHttpTransport()
            .WithTools<IntroductionSkill>()
            .WithTools<SearchSkill>();

        var app = builder.Build();

        app.UseDeveloperExceptionPage();

        app.UseStaticFiles();

        //HeavyProfiler.Enabled = true;
        using (HeavyProfiler.Log("Startup"))
        using (var log = HeavyProfiler.Log("Initial"))
        {
            DynamicLogic.CodeGenDirectory = app.Environment.ContentRootPath + "\\CodeGen";

            Starter.Start(
                app.Configuration.GetConnectionString("ConnectionString")!,
                app.Configuration.GetValue<bool>("IsPostgres"),
                app.Configuration.GetConnectionString("AzureStorageConnectionString"), 
                app.Configuration.GetValue<string>("BroadcastSecret"), 
                app.Configuration.GetValue<string>("BroadcastUrls"), 
                new WebServerBuilder
                {
                    WebApplication = app,
                    AuthTokenEncryptionKey = app.Configuration.GetValue<string>("AuthTokenEncryptionKey")!,
                    MachineName = app.Configuration.GetValue<string?>("ServerName"),
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
            app.UseCors("HealthCheck");

            app.MapControllers();
            app.MapControllerRoute(
                name: "spa-fallback",
                pattern: "{*url}",
                constraints: new { url = new NoAPIContraint() },
                defaults: new { controller = "Home", action = "Index" });

            var gr = app.MapGroup("/mcp-server");
            gr.AddEndpointFilter(async (context, next) =>
            {
                var result = RestApiKeyServer.ApiKeyAuthenticator(context.HttpContext);
                if (result?.UserWithClaims == null)
                    throw new AuthenticationException("No authentication information found!");

                context.HttpContext.Items[SignumAuthenticationFilter.Signum_User_Holder_Key] = result.UserWithClaims;
                using (UserHolder.UserSession(result.UserWithClaims))
                {
                    return await next(context);
                }
            });
            gr.MapMcp();
        }

        SignumInitializeFilterAttribute.InitializeDatabase = () =>
        {
            using (HeavyProfiler.Log("Startup"))
            using (var log = HeavyProfiler.Log("Initial"))
            {
                log.Switch("Initialize");
                using (AuthLogic.Disable())
                    Schema.Current.Initialize();

                if (app.Configuration.GetValue<bool>("StartBackgroundProcesses"))
                {
                    log.Switch("StartRunningProcesses");
                    ProcessRunner.StartRunningProcessesAfter(5 * 1000);

                    log.Switch("StartScheduledTasks");
                    ScheduleTaskRunner.StartScheduledTaskAfter(5 * 1000);

                    log.Switch("StartRunningEmailSenderAsync");
                    AsyncEmailSender.StartAsyncEmailSenderAfter(5 * 1000);
                }

                SystemEventServer.LogStartStop(app.Lifetime);
                
            }
        };
        app.Run(); 
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

public class McpExceptionLoggerProvider : ILoggerProvider
{
    private readonly ConcurrentDictionary<string, SignumExceptionLogger> _loggers = new();

    public ILogger CreateLogger(string categoryName)
    {
        if (categoryName == typeof(McpServerTool).FullName)
            return _loggers.GetOrAdd(categoryName, name => new SignumExceptionLogger(name));

        return NullLogger.Instance;
    }

    public void Dispose() { }
}

public class SignumExceptionLogger : ILogger
{
    private readonly string _name;
    public List<string> Errors { get; } = new();

    public SignumExceptionLogger(string name)
    {
        _name = name;
    }

    public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Error;

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        if (IsEnabled(logLevel) && exception != null)
        {
            exception.LogException(e =>
            {
                e.ControllerName = this._name;
            });
        }
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
}
