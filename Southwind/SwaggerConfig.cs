using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Signum.Authorization;
using Signum.Basics;
using Signum.Chart;
using Signum.Dashboard;
using Signum.Mailing;
using Signum.Processes;
using Signum.Scheduler;
using Signum.Translation;
using Signum.UserQueries;
using Signum.Authorization;
using Signum.Chart;
using Signum.Dashboard;
using Signum.Dynamic;
using Signum.Map;
using Signum.Omnibox;
using Signum.UserQueries;
using Signum.React;
using Signum.Authorization;
using Signum.Cache;
using Signum.Chart;
using Signum.Dashboard;
using Signum.DiffLog;
using Signum.Dynamic;
using Signum.Excel;
using Signum.Facades;
using Signum.Files;
using Signum.MachineLearning;
using Signum.Mailing;
using Signum.Map;
using Signum.Omnibox;
using Signum.Processes;
using Signum.Profiler;
using Signum.Scheduler;
using Signum.Toolbar;
using Signum.Translation;
using Signum.UserQueries;
using Signum.Word;
using Signum.Workflow;
using Southwind;
using Swashbuckle.AspNetCore.SwaggerGen;
using Schema = Signum.Maps.Schema;
using Microsoft.Extensions.Hosting;
using Signum.Rest;
using Signum.RestLog;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using Signum.Rest;
using Southwind.Public;
using Signum.Alerts;
using Signum.ConcurrentUser;

namespace Southwind;

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
                        Schema = context.SchemaGenerator.GenerateSchema(typeof(Signum.Filters.HttpError), context.SchemaRepository)
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


internal static class SwaggerConfig
{
    internal static void ConfigureSwaggerService(WebApplicationBuilder builder)
    {
        //https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-2.1&tabs=visual-studio%2Cvisual-studio-xml            
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Southwind API",
                Version = "v1",
                Description = @"Welcome to the Southwind API, which allows you to seamlessly integrate Southwind with your application.

### <a name=""authentication""></a> Authentication
This API is secured by an API Key.The API Key has either to be sent in the `X-ApiKey` HTTP Header:

```
GET http://localhost/Southwind/api/resource
X-ApiKey: YOUR_API_KEY
```

or as the `apiKey` query parameter:

```
GET http://localhost/Southwind/api/resource?apiKey=YOUR_API_KEY
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
}
