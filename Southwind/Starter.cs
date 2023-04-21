using System.Globalization;
using System.Net.Mail;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using Signum.ActiveDirectory;
using Signum.Alerts;
using Signum.API;
using Signum.API.Filters;
using Signum.Authorization;
using Signum.Authorization.ResetPassword;
using Signum.Authorization.Rules;
using Signum.Authorization.SessionLog;
using Signum.Authorization.UserTicket;
using Signum.Cache;
using Signum.Cache.Broadcast;
using Signum.Chart;
using Signum.Chart.UserChart;
using Signum.ConcurrentUser;
using Signum.Dashboard;
using Signum.DiffLog;
using Signum.Dynamic;
using Signum.Excel;
using Signum.Files;
using Signum.Files.FileTypeAlgorithms;
using Signum.Help;
using Signum.MachineLearning;
using Signum.MachineLearning.TensorFlow;
using Signum.Mailing;
using Signum.Mailing.Package;
using Signum.Map;
using Signum.Migrations;
using Signum.Notes;
using Signum.Omnibox;
using Signum.Processes;
using Signum.Profiler;
using Signum.Rest;
using Signum.Scheduler;
using Signum.SMS;
using Signum.Toolbar;
using Signum.Translation;
using Signum.Translation.Instances;
using Signum.Translation.Translators;
using Signum.UserQueries;
using Signum.ViewLog;
using Signum.Word;
using Signum.Workflow;
using Southwind.Employees;
using Southwind.Globals;
using Southwind.Orders;
using Southwind.Products;
using Southwind.Public;
using Southwind.Shippers;

namespace Southwind.Logic;


//Starts-up the engine for Southwind Entities, used by Web and Load Application
public static partial class Starter
{
    public static ResetLazy<ApplicationConfigurationEntity> Configuration = null!;

    public static string? AzureStorageConnectionString { get; private set; }

    public static void Start(string connectionString, bool isPostgres, string? azureStorageConnectionString, string? broadcastSecret, string? broadcastUrls, WebServerBuilder? wsb, bool includeDynamic = true )
    {
        AzureStorageConnectionString = azureStorageConnectionString;

        using (HeavyProfiler.Log("Start"))
        using (var initial = HeavyProfiler.Log("Initial"))
        {   
            StartParameters.IgnoredDatabaseMismatches = new List<Exception>();
            StartParameters.IgnoredCodeErrors = new List<Exception>();

            string? logDatabase = Connector.TryExtractDatabaseNameWithPostfix(ref connectionString, "_Log");

            SchemaBuilder sb = new CustomSchemaBuilder { LogDatabaseName = logDatabase, Tracer = initial };
            sb.Schema.Version = typeof(Starter).Assembly.GetName().Version!;
            sb.Schema.ForceCultureInfo = CultureInfo.GetCultureInfo("en-US");
            sb.Schema.Settings.ImplementedByAllPrimaryKeyTypes.Add(typeof(Guid)); //because AzureAD
            sb.Schema.Settings.ImplementedByAllPrimaryKeyTypes.Add(typeof(Guid)); //because Customer

            MixinDeclarations.Register<OperationLogEntity, DiffLogMixin>();
            MixinDeclarations.Register<EmailMessageEntity, EmailMessagePackageMixin>();
            MixinDeclarations.Register<UserEntity, UserEmployeeMixin>();
            MixinDeclarations.Register<OrderDetailEmbedded, OrderDetailMixin>();
            MixinDeclarations.Register<BigStringEmbedded, BigStringMixin>();

            ConfigureBigString(sb);
            OverrideAttributes(sb);

            if (!isPostgres)
            {
                var sqlVersion = wsb == null ? SqlServerVersionDetector.Detect(connectionString) : SqlServerVersion.AzureSQL;
                Connector.Default = new SqlServerConnector(connectionString, sb.Schema, sqlVersion!.Value);
            }
            else
            {
                var postgreeVersion = wsb == null ? PostgresVersionDetector.Detect(connectionString) : null;
                Connector.Default = new PostgreSqlConnector(connectionString, sb.Schema, postgreeVersion);
            }

            if (wsb != null)
            {
                SignumServer.Start(wsb);

                ReflectionServer.RegisterLike(typeof(RegisterUserModel), () => true);
            }

            CacheLogic.Start(sb, serverBroadcast: 
                sb.Settings.IsPostgres ? new PostgresBroadcast() : 
                broadcastSecret != null && broadcastUrls != null ? new SimpleHttpBroadcast(broadcastSecret, broadcastUrls) :
                null, wsb: wsb);/*Cache*/

            /* LightDynamic
               DynamicLogic.Start(sb, withCodeGen: false);
            LightDynamic */
            DynamicLogicStarter.Start(sb, wsb);
            if (includeDynamic)//Dynamic
            {
                DynamicLogic.CompileDynamicCode();

                DynamicLogic.RegisterMixins();
                DynamicLogic.BeforeSchema(sb);
            }//Dynamic

            // Framework modules

            TypeLogic.Start(sb);

            OperationLogic.Start(sb);
            ExceptionLogic.Start(sb);
            QueryLogic.Start(sb);

            PermissionLogic.Start(sb);
            // Extensions modules

            MigrationLogic.Start(sb);

            CultureInfoLogic.Start(sb, wsb);
            FilePathEmbeddedLogic.Start(sb);
            BigStringLogic.Start(sb);
            EmailLogic.Start(sb, wsb, () => Configuration.Value.Email, (template, target, message) => Configuration.Value.EmailSender);

            AuthLogic.Start(sb, wsb, "System",  "Anonymous", () => Starter.Configuration.Value.AuthTokens); /* null); anonymous*/
            AuthLogic.Authorizer = new SouthwindAuthorizer(() => Configuration.Value.ActiveDirectory);
            AuthLogic.StartAllModules(sb);
            AzureADLogic.Start(sb, adGroups: true, deactivateUsersTask: true);
            ResetPasswordRequestLogic.Start(sb);
            UserTicketLogic.Start(sb);
            SessionLogLogic.Start(sb);
            TypeConditionLogic.RegisterCompile<UserEntity>(SouthwindTypeCondition.UserEntities, u => u.Is(UserEntity.Current));
			
            ProcessLogic.Start(sb);
            PackageLogic.Start(sb, packages: true, packageOperations: true);

            SchedulerLogic.Start(sb, wsb);
            OmniboxLogic.Start(sb, wsb, 
                new EntityOmniboxResultGenenerator(),
                new DynamicQueryOmniboxResultGenerator(),
                new ChartOmniboxResultGenerator(),
                new DashboardOmniboxResultGenerator(DashboardLogic.Autocomplete),
                new UserQueryOmniboxResultGenerator(UserQueryLogic.Autocomplete),
                new UserChartOmniboxResultGenerator(UserChartLogic.Autocomplete),
                new MapOmniboxResultGenerator(type => OperationLogic.TypeOperations(type).Any()),
                new ReactSpecialOmniboxGenerator()
                //new HelpModuleOmniboxResultGenerator(),
                );

            UserQueryLogic.Start(sb, wsb);
            UserQueryLogic.RegisterUserTypeCondition(sb, SouthwindTypeCondition.UserEntities);
            UserQueryLogic.RegisterRoleTypeCondition(sb, SouthwindTypeCondition.RoleEntities);
            UserQueryLogic.RegisterTranslatableRoutes();                

            ChartLogic.Start(sb, wsb, googleMapsChartScripts: false /*requires Google Maps API key in ChartClient */);
            UserChartLogic.RegisterUserTypeCondition(sb, SouthwindTypeCondition.UserEntities);
            UserChartLogic.RegisterRoleTypeCondition(sb, SouthwindTypeCondition.RoleEntities);
            UserChartLogic.RegisterTranslatableRoutes();

            DashboardLogic.Start(sb, wsb, GetFileTypeAlgorithm(p => p.CachedQueryFolder));
            DashboardLogic.RegisterUserTypeCondition(sb, SouthwindTypeCondition.UserEntities);
            DashboardLogic.RegisterRoleTypeCondition(sb, SouthwindTypeCondition.RoleEntities);
            DashboardLogic.RegisterTranslatableRoutes();
            ViewLogLogic.Start(sb, new HashSet<Type> { typeof(UserQueryEntity), typeof(UserChartEntity), typeof(DashboardEntity) });
            SystemEventLogLogic.Start(sb);
            DiffLogLogic.Start(sb, wsb, registerAll: true);
            ExcelLogic.Start(sb, wsb, excelReport: true);
            ToolbarLogic.Start(sb);
            ToolbarLogic.RegisterTranslatableRoutes();

            SMSLogic.Start(sb, null, () => Configuration.Value.Sms);

            NoteLogic.Start(sb, typeof(UserEntity), /*Note*/typeof(OrderEntity));
            AlertLogic.Start(sb, typeof(UserEntity), /*Alert*/typeof(OrderEntity));
            FileLogic.Start(sb, wsb);

            TranslationLogic.Start(sb, wsb, countLocalizationHits: false,
                new AlreadyTranslatedTranslator(),
                new AzureTranslator(
                    () => Configuration.Value.Translation.AzureCognitiveServicesAPIKey,
                    () => Configuration.Value.Translation.AzureCognitiveServicesRegion),
                new DeepLTranslator(() => Configuration.Value.Translation.DeepLAPIKey));

            TranslatedInstanceLogic.Start(sb, () => CultureInfo.GetCultureInfo("en"));

            HelpLogic.Start(sb);
            WordTemplateLogic.Start(sb, wsb);
            MapLogic.Start(sb, wsb);
            PredictorLogic.Start(sb, wsb, GetFileTypeAlgorithm(p => p.PredictorModelFolder));
            PredictorLogic.RegisterAlgorithm(TensorFlowPredictorAlgorithm.NeuralNetworkGraph, new TensorFlowNeuralNetworkPredictor());
            PredictorLogic.RegisterPublication(ProductPredictorPublication.MonthlySales, new PublicationSettings(typeof(OrderEntity)));

            RestLogLogic.Start(sb, wsb);
            RestApiKeyLogic.Start(sb);

            WorkflowLogicStarter.Start(sb, () => Configuration.Value.Workflow);

            ProfilerLogic.Start(sb,
                wsb,
                timeTracker: true,
                heavyProfiler: true,
                overrideSessionTimeout: true);

            ConcurrentUserLogic.Start(sb, wsb);

            // Southwind modules

            EmployeeLogic.Start(sb);
            ProductLogic.Start(sb);
            CustomerLogic.Start(sb);
            OrderLogic.Start(sb);
            ShipperLogic.Start(sb);

            StartSouthwindConfiguration(sb);

            TypeConditionLogic.Register<OrderEntity>(SouthwindTypeCondition.CurrentEmployee, o => o.Employee.Is(EmployeeEntity.Current));

            if (includeDynamic)//2
            {
                DynamicLogic.StartDynamicModules(sb);
            }//2

            SetupCache(sb);

            Schema.Current.OnSchemaCompleted();

            if (includeDynamic)//3
            {
                DynamicLogic.RegisterExceptionIfAny();
            }//3

            if (wsb != null)
            {
                ReflectionServer.RegisterLike(typeof(RegisterUserModel), () => true);

            }
        }
    }


    public static void ConfigureBigString(SchemaBuilder sb)
    {
        BigStringMode mode = BigStringMode.File;

        FileTypeLogic.Register(BigStringFileType.Exceptions, GetFileTypeAlgorithm(c => c.ExceptionsFolder));
        BigStringLogic.RegisterAll<ExceptionEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.Exceptions));

        FileTypeLogic.Register(BigStringFileType.OperationLog, GetFileTypeAlgorithm(c => c.OperationLogFolder));
        BigStringLogic.RegisterAll<OperationLogEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.OperationLog));

        FileTypeLogic.Register(BigStringFileType.ViewLog, GetFileTypeAlgorithm(c => c.ViewLogFolder));
        BigStringLogic.RegisterAll<ViewLogEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.ViewLog));

        FileTypeLogic.Register(BigStringFileType.EmailMessage, GetFileTypeAlgorithm(c => c.EmailMessageFolder));
        BigStringLogic.RegisterAll<EmailMessageEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.EmailMessage));
    }//ConfigureBigString

    public static IFileTypeAlgorithm GetFileTypeAlgorithm(Func<FoldersConfigurationEmbedded, string> getFolder, bool weakFileReference = false)
    {
        if (string.IsNullOrEmpty(AzureStorageConnectionString))
            return new FileTypeAlgorithm(fp => new PrefixPair(getFolder(Starter.Configuration.Value.Folders)))
            {
                WeakFileReference = weakFileReference
            };
        else
            return new AzureBlobStoragebFileTypeAlgorithm(fp => new BlobContainerClient(
                AzureStorageConnectionString,
                getFolder(Starter.Configuration.Value.Folders)))
            {
                CreateBlobContainerIfNotExists = true,
                WeakFileReference = weakFileReference,
            };
    }

    public class CustomSchemaBuilder : SchemaBuilder
    {
        public CustomSchemaBuilder() : base(true)
        {
        }

        public string? LogDatabaseName;

        public override DatabaseName? GetDatabase(Type type)
        {
            if (this.LogDatabaseName == null)
                return null;

            if (InLogDatabase.Contains(type))
                return new DatabaseName(null, this.LogDatabaseName, this.Schema.Settings.IsPostgres);

            return null;
        }

        public Type[] InLogDatabase = new Type[]
        {
            typeof(OperationLogEntity),
            typeof(ExceptionEntity),
        };
    }

    private static void OverrideAttributes(SchemaBuilder sb)
    {
        PredictorLogic.IgnorePinned(sb);

        sb.Schema.Settings.TypeAttributes<OrderEntity>().Add(new SystemVersionedAttribute());

        sb.Schema.Settings.FieldAttributes((RestLogEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((ExceptionEntity ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((OperationLogEntity ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((SystemEventLogEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));

        sb.Schema.Settings.FieldAttributes((ToolbarEntity tb) => tb.Elements.First().Content).Replace(new ImplementedByAttribute(typeof(ToolbarMenuEntity), typeof(ToolbarEntity), typeof(QueryEntity), typeof(UserQueryEntity), typeof(UserChartEntity), typeof(DashboardEntity), typeof(PermissionSymbol)));
        sb.Schema.Settings.FieldAttributes((ToolbarMenuEntity tbm) => tbm.Elements.First().Content).Replace(new ImplementedByAttribute(typeof(ToolbarMenuEntity), typeof(ToolbarEntity), typeof(QueryEntity), typeof(UserQueryEntity), typeof(UserChartEntity), typeof(DashboardEntity), typeof(PermissionSymbol)));

        sb.Schema.Settings.FieldAttributes((UserQueryEntity uq) => uq.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
        sb.Schema.Settings.FieldAttributes((UserChartEntity uc) => uc.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
        sb.Schema.Settings.FieldAttributes((DashboardEntity cp) => cp.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));

        sb.Schema.Settings.FieldAttributes((DashboardEntity a) => a.Parts.First().Content).Replace(new ImplementedByAttribute(typeof(UserChartPartEntity), typeof(CombinedUserChartPartEntity), typeof(UserQueryPartEntity), typeof(ValueUserQueryListPartEntity), typeof(LinkListPartEntity)));

        sb.Schema.Settings.FieldAttributes((CachedQueryEntity a) => a.UserAssets.First()).Replace(new ImplementedByAttribute(typeof(UserQueryEntity), typeof(UserChartEntity)));

        sb.Schema.Settings.FieldAttributes((ViewLogEntity cp) => cp.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((NoteEntity n) => n.CreatedBy).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((AlertEntity a) => a.CreatedBy).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((AlertEntity a) => a.Recipient).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((AlertEntity a) => a.AttendedBy).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((PackageLineEntity cp) => cp.Package).Replace(new ImplementedByAttribute(typeof(PackageEntity), typeof(PackageOperationEntity)));
        sb.Schema.Settings.FieldAttributes((ProcessExceptionLineEntity cp) => cp.Line).Replace(new ImplementedByAttribute(typeof(PackageLineEntity)));
        sb.Schema.Settings.FieldAttributes((ProcessEntity cp) => cp.Data).Replace(new ImplementedByAttribute(typeof(PackageEntity), typeof(PackageOperationEntity), typeof(EmailPackageEntity), typeof(AutoconfigureNeuralNetworkEntity), typeof(PredictorEntity)));
        sb.Schema.Settings.FieldAttributes((ProcessEntity s) => s.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((EmailMessageEntity em) => em.From.EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((EmailMessageEntity em) => em.Recipients.First().EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((EmailSenderConfigurationEntity em) => em.DefaultFrom!.EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((EmailSenderConfigurationEntity em) => em.AdditionalRecipients.First().EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((ScheduledTaskEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        sb.Schema.Settings.FieldAttributes((ScheduledTaskLogEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
    }

    private static void StartSouthwindConfiguration(SchemaBuilder sb)
    {
        sb.Include<ApplicationConfigurationEntity>()
            .WithSave(ApplicationConfigurationOperation.Save)
            .WithQuery(() => s => new
            {
                Entity = s,
                s.Id,
                s.Environment,
                s.Email.SendEmails,
                s.Email.OverrideEmailAddress,
                s.Email.DefaultCulture,
                s.Email.UrlLeft
            });

        Configuration = sb.GlobalLazy<ApplicationConfigurationEntity>(
            () => Database.Query<ApplicationConfigurationEntity>().Single(a => a.DatabaseName == Connector.Current.DatabaseName()),
            new InvalidateWith(typeof(ApplicationConfigurationEntity)));
    }

    private static void SetupCache(SchemaBuilder sb)
    {
        CacheLogic.CacheTable<ShipperEntity>(sb);
    }
}
