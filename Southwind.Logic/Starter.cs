using System;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Engine.Basics;
using Signum.Engine.Chart;
using Signum.Engine.Dashboard;
using Signum.Engine.Disconnected;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Mailing;
using Signum.Engine.Maps;
using Signum.Engine.Operations;
using Signum.Engine.UserQueries;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Entities.Basics;
using Signum.Entities.Chart;
using Signum.Entities.Dashboard;
using Signum.Entities.Disconnected;
using Signum.Entities.Mailing;
using Signum.Entities.UserQueries;
using Signum.Utilities;
using Signum.Utilities.ExpressionTrees;
using Southwind.Entities;
using Signum.Engine.Processes;
using Signum.Entities.Processes;
using Signum.Engine.Alerts;
using Signum.Engine.Notes;
using Signum.Engine.Cache;
using Signum.Engine.Profiler;
using Signum.Engine.Translation;
using Signum.Engine.Files;
using Signum.Entities.Alerts;
using Signum.Entities.Notes;
using Signum.Entities.UserAssets;
using Signum.Engine.UserAssets;
using Signum.Engine.Scheduler;
using Signum.Entities.Scheduler;
using Signum.Engine.SMS;
using Signum.Engine.ViewLog;
using System.Collections.Generic;
using Signum.Entities.ViewLog;
using Signum.Engine.Help;
using Signum.Engine.Word;
using Signum.Entities.Word;
using Signum.Engine.Migrations;
using Signum.Entities.DynamicQuery;
using System.Net.Mail;
using Signum.Engine.DiffLog;
using Signum.Entities.DiffLog;
using Signum.Engine.Map;
using Signum.Engine.Excel;
using Signum.Engine.Dynamic;
using Signum.Entities.Dynamic;
using Signum.Engine.Workflow;
using Signum.Engine.Toolbar;
using Signum.Engine.MachineLearning;
using Signum.Entities.MachineLearning;
using Signum.Entities.Files;
using Signum.Engine.MachineLearning.CNTK;
using Signum.Entities.Rest;
using Signum.Engine.Rest;
using Microsoft.Exchange.WebServices.Data;
using Signum.Engine.Omnibox;

namespace Southwind.Logic
{

    //Starts-up the engine for Southwind Entities, used by Web and Load Application
    public static partial class Starter
    {
        public static ResetLazy<ApplicationConfigurationEntity> Configuration = null!;

        public static void Start(string connectionString, bool isPostgres, bool includeDynamic = true, bool detectSqlVersion = true)
        {
            using (HeavyProfiler.Log("Start"))
            using (var initial = HeavyProfiler.Log("Initial"))
            {
                StartParameters.IgnoredDatabaseMismatches = new List<Exception>();
                StartParameters.IgnoredCodeErrors = new List<Exception>();

                string? logDatabase = Connector.TryExtractDatabaseNameWithPostfix(ref connectionString, "_Log");

                SchemaBuilder sb = new CustomSchemaBuilder { LogDatabaseName = logDatabase, Tracer = initial };
                sb.Schema.Version = typeof(Starter).Assembly.GetName().Version!;
                sb.Schema.ForceCultureInfo = CultureInfo.GetCultureInfo("en-US");

                MixinDeclarations.Register<OperationLogEntity, DiffLogMixin>();
                MixinDeclarations.Register<UserEntity, UserEmployeeMixin>();
                MixinDeclarations.Register<OrderDetailEmbedded, OrderDetailMixin>();
                MixinDeclarations.Register<BigStringEmbedded, BigStringMixin>();

                ConfigureBigString(sb);
                OverrideAttributes(sb);

                if (!isPostgres)
                {
                    var sqlVersion = detectSqlVersion ? SqlServerVersionDetector.Detect(connectionString) : SqlServerVersion.AzureSQL;
                    Connector.Default = new SqlServerConnector(connectionString, sb.Schema, sqlVersion!.Value);
                }
                else
                {
                    var postgreeVersion = detectSqlVersion ? PostgresVersionDetector.Detect(connectionString) : null;
                    Connector.Default = new PostgreSqlConnector(connectionString, sb.Schema, postgreeVersion);
                }

                CacheLogic.Start(sb, cacheInvalidator: sb.Settings.IsPostgres ? new PostgresCacheInvalidation() : null);

                DynamicLogicStarter.Start(sb);
                if (includeDynamic)
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

                // Extensions modules

                MigrationLogic.Start(sb);

                CultureInfoLogic.Start(sb);
                FilePathEmbeddedLogic.Start(sb);
                BigStringLogic.Start(sb);
                EmailLogic.Start(sb, () => Configuration.Value.Email, (template, target, message) => Configuration.Value.EmailSender);

                AuthLogic.Start(sb, "System",  "Anonymous"); /* null); anonymous*/
 
                AuthLogic.StartAllModules(sb);
                ResetPasswordRequestLogic.Start(sb);
                UserTicketLogic.Start(sb);
                SessionLogLogic.Start(sb);
                WebAuthnLogic.Start(sb);

                ProcessLogic.Start(sb);
                PackageLogic.Start(sb, packages: true, packageOperations: true);

                SchedulerLogic.Start(sb);
                OmniboxLogic.Start(sb);

                UserQueryLogic.Start(sb);
                UserQueryLogic.RegisterUserTypeCondition(sb, SouthwindGroup.UserEntities);
                UserQueryLogic.RegisterRoleTypeCondition(sb, SouthwindGroup.RoleEntities);
                
                ChartLogic.Start(sb, googleMapsChartScripts: false /*requires Google Maps API key in ChartClient */);
                UserChartLogic.RegisterUserTypeCondition(sb, SouthwindGroup.UserEntities);
                UserChartLogic.RegisterRoleTypeCondition(sb, SouthwindGroup.RoleEntities);
                
                DashboardLogic.Start(sb);
                DashboardLogic.RegisterUserTypeCondition(sb, SouthwindGroup.UserEntities);
                DashboardLogic.RegisterRoleTypeCondition(sb, SouthwindGroup.RoleEntities);
                ViewLogLogic.Start(sb, new HashSet<Type> { typeof(UserQueryEntity), typeof(UserChartEntity), typeof(DashboardEntity) });
                DiffLogLogic.Start(sb, registerAll: true);
                ExcelLogic.Start(sb, excelReport: true);
                ToolbarLogic.Start(sb);

                SMSLogic.Start(sb, null, () => Configuration.Value.Sms);

                NoteLogic.Start(sb, typeof(UserEntity), /*Note*/typeof(OrderEntity));
                AlertLogic.Start(sb, typeof(UserEntity), /*Alert*/typeof(OrderEntity));
                FileLogic.Start(sb);

                TranslationLogic.Start(sb, countLocalizationHits: false);
                TranslatedInstanceLogic.Start(sb, () => CultureInfo.GetCultureInfo("en"));

                HelpLogic.Start(sb);
                WordTemplateLogic.Start(sb);
                MapLogic.Start(sb);
                PredictorLogic.Start(sb, () => new FileTypeAlgorithm(f => new PrefixPair(Starter.Configuration.Value.Folders.PredictorModelFolder)));
                PredictorLogic.RegisterAlgorithm(CNTKPredictorAlgorithm.NeuralNetwork, new CNTKNeuralNetworkPredictorAlgorithm());
                PredictorLogic.RegisterPublication(ProductPredictorPublication.MonthlySales, new PublicationSettings(typeof(OrderEntity)));

                RestLogLogic.Start(sb);
                RestApiKeyLogic.Start(sb);

                WorkflowLogicStarter.Start(sb, () => Starter.Configuration.Value.Workflow);

                ProfilerLogic.Start(sb,
                    timeTracker: true,
                    heavyProfiler: true,
                    overrideSessionTimeout: true);

                // Southwind modules

                EmployeeLogic.Start(sb);
                ProductLogic.Start(sb);
                CustomerLogic.Start(sb);
                OrderLogic.Start(sb);
                ShipperLogic.Start(sb);

                StartSouthwindConfiguration(sb);

                TypeConditionLogic.Register<OrderEntity>(SouthwindGroup.UserEntities, o => o.Employee == EmployeeEntity.Current);
                TypeConditionLogic.Register<EmployeeEntity>(SouthwindGroup.UserEntities, e => EmployeeEntity.Current.Is(e));

                TypeConditionLogic.Register<OrderEntity>(SouthwindGroup.CurrentCustomer, o => o.Customer == CustomerEntity.Current);
                TypeConditionLogic.Register<PersonEntity>(SouthwindGroup.CurrentCustomer, o => o == CustomerEntity.Current);
                TypeConditionLogic.Register<CompanyEntity>(SouthwindGroup.CurrentCustomer, o => o == CustomerEntity.Current);

                if (includeDynamic)
                {
                    DynamicLogic.StartDynamicModules(sb);
                    DynamicLogic.RegisterExceptionIfAny();
                }
                SetupCache(sb);

                Schema.Current.OnSchemaCompleted();
            }
        }

        public static void ConfigureBigString(SchemaBuilder sb)
        {
            BigStringMode mode = BigStringMode.FileSystem;

            FileTypeLogic.Register(BigStringFileType.Exceptions, new FileTypeAlgorithm(f => new PrefixPair(Starter.Configuration.Value.Folders.ExceptionsFolder)));
            BigStringLogic.RegisterAll<ExceptionEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.Exceptions));

            FileTypeLogic.Register(BigStringFileType.OperationLog, new FileTypeAlgorithm(f => new PrefixPair(Starter.Configuration.Value.Folders.OperationLogFolder)));
            BigStringLogic.RegisterAll<OperationLogEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.OperationLog));

            FileTypeLogic.Register(BigStringFileType.ViewLog, new FileTypeAlgorithm(f => new PrefixPair(Starter.Configuration.Value.Folders.ViewLogFolder)));
            BigStringLogic.RegisterAll<ViewLogEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.ViewLog));

            FileTypeLogic.Register(BigStringFileType.EmailMessage, new FileTypeAlgorithm(f => new PrefixPair(Starter.Configuration.Value.Folders.EmailMessageFolder)));
            BigStringLogic.RegisterAll<EmailMessageEntity>(sb, new BigStringConfiguration(mode, BigStringFileType.EmailMessage));
        }//ConfigureBigString

        public class CustomSchemaBuilder : SchemaBuilder
        {
            public CustomSchemaBuilder() : base(true)
            {
            }

            public string? LogDatabaseName;

            public override ObjectName GenerateTableName(Type type, TableNameAttribute? tn)
            {
                return base.GenerateTableName(type, tn).OnSchema(GetSchemaName(type));
            }

            public override ObjectName GenerateTableNameCollection(Table table, NameSequence name, TableNameAttribute? tn)
            {
                return base.GenerateTableNameCollection(table, name, tn).OnSchema(GetSchemaName(table.Type));
            }

            SchemaName GetSchemaName(Type type)
            {
                var isPostgres = this.Schema.Settings.IsPostgres;
                return new SchemaName(this.GetDatabaseName(type), GetSchemaNameName(type) ?? SchemaName.Default(isPostgres).Name, isPostgres);
            }

            public Type[] InLogDatabase = new Type[]
            {
                typeof(OperationLogEntity),
                typeof(ExceptionEntity),
            };

            DatabaseName? GetDatabaseName(Type type)
            {
                if (this.LogDatabaseName == null)
                    return null;

                if (InLogDatabase.Contains(type))
                    return new DatabaseName(null, this.LogDatabaseName, this.Schema.Settings.IsPostgres);

                return null;
            }

            static string? GetSchemaNameName(Type type)
            {
                type = EnumEntity.Extract(type) ?? type;

                if (type == typeof(ColumnOptionsMode) || type == typeof(FilterOperation) || type == typeof(PaginationMode) || type == typeof(OrderType))
                    type = typeof(UserQueryEntity);

                if (type == typeof(SmtpDeliveryFormat) || type == typeof(SmtpDeliveryMethod) || type == typeof(ExchangeVersion))
                    type = typeof(EmailMessageEntity);

                if (type == typeof(DayOfWeek))
                    type = typeof(ScheduledTaskEntity);

                if (type.Assembly == typeof(ApplicationConfigurationEntity).Assembly)
                    return null;

                if (type.Namespace == DynamicCode.CodeGenEntitiesNamespace)
                    return "codegen";

                if (type.Assembly == typeof(DashboardEntity).Assembly)
                {
                    var name = type.Namespace!.Replace("Signum.Entities.", "");

                    name = (name.TryBefore('.') ?? name);

                    if (name == "SMS")
                        return "sms";

                    if (name == "Authorization")
                        return "auth";

                    return name.FirstLower();
                }

                if (type.Assembly == typeof(Entity).Assembly)
                    return "framework";

                throw new InvalidOperationException("Impossible to determine SchemaName for {0}".FormatWith(type.FullName));
            }
        }

        private static void OverrideAttributes(SchemaBuilder sb)
        {
            PredictorLogic.IgnorePinned(sb);

            sb.Schema.Settings.TypeAttributes<OrderEntity>().Add(new SystemVersionedAttribute());

            sb.Schema.Settings.FieldAttributes((RestLogEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((ExceptionEntity ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((OperationLogEntity ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((UserQueryEntity uq) => uq.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
            sb.Schema.Settings.FieldAttributes((UserChartEntity uc) => uc.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
            sb.Schema.Settings.FieldAttributes((DashboardEntity cp) => cp.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
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
            sb.Schema.Settings.FieldAttributes((DashboardEntity a) => a.Parts[0].Content).Replace(new ImplementedByAttribute(typeof(UserChartPartEntity), typeof(UserQueryPartEntity), typeof(ValueUserQueryListPartEntity), typeof(LinkListPartEntity)));
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
}
