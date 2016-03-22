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
using Southwind.Logic.Properties;
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

namespace Southwind.Logic
{

    //Starts-up the engine for Southwind Entities, used by Web and Load Application
    public static partial class Starter
    {
        public static ResetLazy<ApplicationConfigurationEntity> Configuration;


        public static void Start(string connectionString)
        {
            string logDatabase = Connector.TryExtractDatabaseNameWithPostfix(ref connectionString, "_Log");

            SchemaBuilder sb = new SchemaBuilder();
            sb.Schema.Version = typeof(Starter).Assembly.GetName().Version;
            sb.Schema.ForceCultureInfo = CultureInfo.GetCultureInfo("en-US");

            MixinDeclarations.Register<OperationLogEntity, DiffLogMixin>();
            MixinDeclarations.Register<UserEntity, UserEmployeeMixin>();

            OverrideAttributes(sb);

            SetupDisconnectedStrategies(sb);

            DynamicQueryManager dqm = new DynamicQueryManager();

            Connector.Default = new SqlConnector(connectionString, sb.Schema, dqm, SqlServerVersion.SqlServer2012);

            CacheLogic.Start(sb);

            TypeLogic.Start(sb, dqm);

            OperationLogic.Start(sb, dqm);

            MigrationLogic.Start(sb, dqm);

            CultureInfoLogic.Start(sb, dqm);
            EmbeddedFilePathLogic.Start(sb, dqm);
            SmtpConfigurationLogic.Start(sb, dqm);
            EmailLogic.Start(sb, dqm, () => Configuration.Value.Email, et => Configuration.Value.SmtpConfiguration);

            AuthLogic.Start(sb, dqm, "System", null);

            AuthLogic.StartAllModules(sb, dqm);
            ResetPasswordRequestLogic.Start(sb, dqm);
            UserTicketLogic.Start(sb, dqm);
            SessionLogLogic.Start(sb, dqm);

            ProcessLogic.Start(sb, dqm);
            PackageLogic.Start(sb, dqm, packages: true, packageOperations: true);

            MapLogic.Start(sb, dqm);
            SchedulerLogic.Start(sb, dqm);

            QueryLogic.Start(sb);
            UserQueryLogic.Start(sb, dqm);
            UserQueryLogic.RegisterUserTypeCondition(sb, SouthwindGroup.UserEntities);
            UserQueryLogic.RegisterRoleTypeCondition(sb, SouthwindGroup.RoleEntities);
            ChartLogic.Start(sb, dqm);
            UserChartLogic.RegisterUserTypeCondition(sb, SouthwindGroup.UserEntities);
            UserChartLogic.RegisterRoleTypeCondition(sb, SouthwindGroup.RoleEntities);
            DashboardLogic.Start(sb, dqm);
            DashboardLogic.RegisterUserTypeCondition(sb, SouthwindGroup.UserEntities);
            DashboardLogic.RegisterRoleTypeCondition(sb, SouthwindGroup.RoleEntities);
            ViewLogLogic.Start(sb, dqm, new HashSet<Type> { typeof(UserQueryEntity), typeof(UserChartEntity), typeof(DashboardEntity) });
            DiffLogLogic.Start(sb, dqm);

            ExceptionLogic.Start(sb, dqm);

            SMSLogic.Start(sb, dqm, null, () => Configuration.Value.Sms);
            SMSLogic.RegisterPhoneNumberProvider<PersonEntity>(p => p.Phone, p => null);
            SMSLogic.RegisterDataObjectProvider((PersonEntity p) => new { p.FirstName, p.LastName, p.Title, p.DateOfBirth });
            SMSLogic.RegisterPhoneNumberProvider<CompanyEntity>(p => p.Phone, p => null);

            NoteLogic.Start(sb, dqm, typeof(UserEntity), /*Note*/typeof(OrderEntity));
            AlertLogic.Start(sb, dqm, typeof(UserEntity), /*Alert*/typeof(OrderEntity));
            FileLogic.Start(sb, dqm);

            TranslationLogic.Start(sb, dqm);
            TranslatedInstanceLogic.Start(sb, dqm, () => CultureInfo.GetCultureInfo("en"));

            HelpLogic.Start(sb, dqm);
            WordTemplateLogic.Start(sb, dqm);

            EmployeeLogic.Start(sb, dqm);
            ProductLogic.Start(sb, dqm);
            CustomerLogic.Start(sb, dqm);
            OrderLogic.Start(sb, dqm);
            ShipperLogic.Start(sb, dqm);

            StartSouthwindConfiguration(sb, dqm);

            TypeConditionLogic.Register<OrderEntity>(SouthwindGroup.UserEntities, o => o.Employee.RefersTo(EmployeeEntity.Current));
            TypeConditionLogic.Register<EmployeeEntity>(SouthwindGroup.UserEntities, e => e == EmployeeEntity.Current);

            TypeConditionLogic.Register<OrderEntity>(SouthwindGroup.CurrentCustomer, o => o.Customer == CustomerEntity.Current);
            TypeConditionLogic.Register<PersonEntity>(SouthwindGroup.CurrentCustomer, o => o == CustomerEntity.Current);
            TypeConditionLogic.Register<CompanyEntity>(SouthwindGroup.CurrentCustomer, o => o == CustomerEntity.Current);

            DisconnectedLogic.Start(sb, dqm);
            DisconnectedLogic.BackupFolder = @"D:\SouthwindTemp\Backups";
            DisconnectedLogic.BackupNetworkFolder = @"D:\SouthwindTemp\Backups";
            DisconnectedLogic.DatabaseFolder = @"D:\SouthwindTemp\Database";

            ProfilerLogic.Start(sb, dqm,
                timeTracker: true,
                heavyProfiler: true,
                overrideSessionTimeout: true);

            SetupCache(sb);

            SetSchemaNames(Schema.Current);

            if (logDatabase.HasText())
                SetLogDatabase(sb.Schema, new DatabaseName(null, logDatabase));

            Schema.Current.OnSchemaCompleted();
        }

        private static void SetSchemaNames(Schema schema)
        {
            foreach (var gr in schema.Tables.Values.GroupBy(a => GetSchemaName(a)))
            {
                if (gr.Key != null)
                {
                    SchemaName sn = new SchemaName(null, gr.Key);
                    foreach (var t in gr)
                        t.ToSchema(sn);
                }
            }
        }

        private static string GetSchemaName(Table table)
        {
            Type type = EnumEntity.Extract(table.Type) ?? table.Type;

            if (type == typeof(ColumnOptionsMode) || type == typeof(FilterOperation) || type == typeof(PaginationMode) || type == typeof(OrderType))
                type = typeof(UserQueryEntity);

            if (type == typeof(SmtpDeliveryFormat) || type == typeof(SmtpDeliveryMethod))
                type = typeof(EmailMessageEntity);

            if (type == typeof(DayOfWeek))
                type = typeof(ScheduledTaskEntity);

            if (type.Assembly == typeof(ApplicationConfigurationEntity).Assembly)
                return null;

            if (type.Assembly == typeof(DashboardEntity).Assembly)
            {
                var name = type.Namespace.Replace("Signum.Entities.", "");

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

        private static void OverrideAttributes(SchemaBuilder sb)
        {
            sb.Schema.Settings.FieldAttributes((ExceptionEntity ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((OperationLogEntity ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((UserQueryEntity uq) => uq.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
            sb.Schema.Settings.FieldAttributes((UserChartEntity uc) => uc.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
            sb.Schema.Settings.FieldAttributes((DashboardEntity cp) => cp.Owner).Replace(new ImplementedByAttribute(typeof(UserEntity), typeof(RoleEntity)));
            sb.Schema.Settings.FieldAttributes((ViewLogEntity cp) => cp.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((NoteEntity n) => n.CreatedBy).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((AlertEntity a) => a.CreatedBy).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((AlertEntity a) => a.AttendedBy).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((ProcessEntity cp) => cp.Data).Replace(new ImplementedByAttribute(typeof(PackageEntity), typeof(PackageOperationEntity)));
            sb.Schema.Settings.FieldAttributes((PackageLineEntity cp) => cp.Package).Replace(new ImplementedByAttribute(typeof(PackageEntity), typeof(PackageOperationEntity)));
            sb.Schema.Settings.FieldAttributes((ProcessExceptionLineEntity cp) => cp.Line).Replace(new ImplementedByAttribute(typeof(PackageLineEntity)));
            sb.Schema.Settings.FieldAttributes((ProcessEntity s) => s.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((EmailMessageEntity em) => em.From.EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((EmailMessageEntity em) => em.Recipients.First().EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((SmtpConfigurationEntity sc) => sc.DefaultFrom.EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((SmtpConfigurationEntity sc) => sc.AdditionalRecipients.First().EmailOwner).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((ScheduledTaskEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
            sb.Schema.Settings.FieldAttributes((ScheduledTaskLogEntity a) => a.User).Replace(new ImplementedByAttribute(typeof(UserEntity)));
        }

        private static void StartSouthwindConfiguration(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            sb.Include<ApplicationConfigurationEntity>();
            Configuration = sb.GlobalLazy<ApplicationConfigurationEntity>(
                () => Database.Query<ApplicationConfigurationEntity>().Single(a => a.Environment == Settings.Default.Environment),
                new InvalidateWith(typeof(ApplicationConfigurationEntity)));

            new Graph<ApplicationConfigurationEntity>.Execute(ApplicationConfigurationOperation.Save)
            {
                AllowsNew = true,
                Lite = false,
                Execute = (e, _) => { },
            }.Register();

            dqm.RegisterQuery(typeof(ApplicationConfigurationEntity), () =>
                from s in Database.Query<ApplicationConfigurationEntity>()
                select new
                {
                    Entity = s,
                    s.Id,
                    s.Environment,
                    s.Email.SendEmails,
                    s.Email.OverrideEmailAddress,
                    s.Email.DefaultCulture,
                    s.Email.UrlLeft
                });
        }

        private static void SetupCache(SchemaBuilder sb)
        {
            CacheLogic.CacheTable<ShipperEntity>(sb);
        }

        public static void SetLogDatabase(Schema schema, DatabaseName logDatabaseName)
        {
            schema.Table<OperationLogEntity>().ToDatabase(logDatabaseName);
            schema.Table<ExceptionEntity>().ToDatabase(logDatabaseName);
        }
    }
}
