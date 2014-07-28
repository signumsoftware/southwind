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
using Signum.Engine.Exceptions;
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

namespace Southwind.Logic
{

    //Starts-up the engine for Southwind Entities, used by Web and Load Application
    public static partial class Starter
    {
        public static ResetLazy<ApplicationConfigurationDN> Configuration;


        public static void Start(string connectionString)
        {
            string logPostfix = Connector.TryExtractCatalogPostfix(ref connectionString, "_Log");

            MixinDeclarations.Register<UserDN, UserEmployeeMixin>();
            MixinDeclarations.Register<ProcessDN, UserProcessSessionMixin>();

            SchemaBuilder sb = new SchemaBuilder(DBMS.SqlServer2012);
            sb.Schema.Version = typeof(Starter).Assembly.GetName().Version;
            sb.Schema.ForceCultureInfo = CultureInfo.GetCultureInfo("en-US");

            OverrideAttributes(sb);

            SetupDisconnectedStrategies(sb);

            DynamicQueryManager dqm = new DynamicQueryManager();

            Connector.Default = new SqlConnector(connectionString, sb.Schema, dqm);

            CacheLogic.Start(sb);

            TypeLogic.Start(sb, dqm); 

            OperationLogic.Start(sb, dqm);

            CultureInfoLogic.Start(sb, dqm);
            FilePathLogic.Start(sb, dqm);
            EmailLogic.Start(sb, dqm, () => Configuration.Value.Email);

            AuthLogic.Start(sb, dqm, "System", null);
       
            AuthLogic.StartAllModules(sb, dqm);
            ResetPasswordRequestLogic.Start(sb, dqm);
            UserTicketLogic.Start(sb, dqm);
            SessionLogLogic.Start(sb, dqm);

            ProcessLogic.Start(sb, dqm, userProcessSession: true);
            PackageLogic.Start(sb, dqm, packages: true, packageOperations: true);

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
            UserAssetLogLogic.Start(sb, dqm); 

            ExceptionLogic.Start(sb, dqm);

            SMSLogic.Start(sb, dqm, null, () => Configuration.Value.Sms);
            SMSLogic.RegisterPhoneNumberProvider<PersonDN>(p => p.Phone, p => null);
            SMSLogic.RegisterDataObjectProvider((PersonDN p) => new { p.FirstName, p.LastName, p.Title, p.DateOfBirth });
            SMSLogic.RegisterPhoneNumberProvider<CompanyDN>(p => p.Phone, p => null);

            AlertLogic.Start(sb, dqm, new[] { typeof(PersonDN), typeof(CompanyDN), typeof(OrderDN) });
            NoteLogic.Start(sb, dqm, new[] { typeof(PersonDN), typeof(CompanyDN), typeof(OrderDN) });
            FileLogic.Start(sb, dqm);

            TranslationLogic.Start(sb, dqm);
            TranslatedInstanceLogic.Start(sb, dqm, "en"); 

            EmployeeLogic.Start(sb, dqm);
            ProductLogic.Start(sb, dqm);
            CustomerLogic.Start(sb, dqm); 
            OrderLogic.Start(sb, dqm);
            ShipperLogic.Start(sb, dqm);

            StartSouthwindConfiguration(sb, dqm);

            TypeConditionLogic.Register<OrderDN>(SouthwindGroup.UserEntities, o => o.Employee.RefersTo(EmployeeDN.Current));
            TypeConditionLogic.Register<EmployeeDN>(SouthwindGroup.UserEntities, e => e == EmployeeDN.Current);

            TypeConditionLogic.Register<OrderDN>(SouthwindGroup.CurrentCustomer, o => o.Customer == CustomerDN.Current);
            TypeConditionLogic.Register<PersonDN>(SouthwindGroup.CurrentCustomer, o => o == CustomerDN.Current);
            TypeConditionLogic.Register<CompanyDN>(SouthwindGroup.CurrentCustomer, o => o == CustomerDN.Current);

            DisconnectedLogic.Start(sb, dqm);
            DisconnectedLogic.BackupFolder = @"D:\SouthwindTemp\Backups";
            DisconnectedLogic.BackupNetworkFolder = @"D:\SouthwindTemp\Backups";
            DisconnectedLogic.DatabaseFolder = @"D:\SouthwindTemp\Database";

            ProfilerLogic.Start(sb, dqm, 
                timeTracker: true, 
                heavyProfiler: true, 
                overrideSessionTimeout: true);

            SetupCache(sb);

            sb.ExecuteWhenIncluded();

            if (logPostfix.HasText())
                SetLogDatabase(sb.Schema, new DatabaseName(null, ((SqlConnector)Connector.Current).DatabaseName() + logPostfix));
        }

        private static void OverrideAttributes(SchemaBuilder sb)
        {
            sb.Schema.Settings.OverrideAttributes((ExceptionDN ua) => ua.User, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((OperationLogDN ua) => ua.User, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((UserQueryDN uq) => uq.Owner, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideAttributes((UserChartDN uc) => uc.Owner, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideAttributes((DashboardDN cp) => cp.Owner, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideAttributes((UserAssetLogDN cp) => cp.User, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((UserAssetLogDN cp) => cp.Asset, new ImplementedByAttribute(typeof(UserQueryDN), typeof(UserChartDN), typeof(DashboardDN)));
            sb.Schema.Settings.OverrideAttributes((NoteDN n) => n.CreatedBy, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((AlertDN a) => a.CreatedBy, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((AlertDN a) => a.AttendedBy, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((ProcessDN cp) => cp.Data, new ImplementedByAttribute(typeof(PackageDN), typeof(PackageOperationDN)));
            sb.Schema.Settings.OverrideAttributes((PackageLineDN cp) => cp.Package, new ImplementedByAttribute(typeof(PackageDN), typeof(PackageOperationDN)));
            sb.Schema.Settings.OverrideAttributes((ProcessExceptionLineDN cp) => cp.Line, new ImplementedByAttribute(typeof(PackageLineDN)));
            sb.Schema.Settings.OverrideAttributes((ProcessDN s) => s.Mixin<UserProcessSessionMixin>().User, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((EmailMessageDN em) => em.From.EmailOwner, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((EmailMessageDN em) => em.Recipients.First().EmailOwner, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((SmtpConfigurationDN sc) => sc.DefaultFrom.EmailOwner, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((SmtpConfigurationDN sc) => sc.AditionalRecipients.First().EmailOwner, new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.OverrideAttributes((ScheduledTaskLogDN a) => a.User, new ImplementedByAttribute(typeof(UserDN)));
        }

        private static void StartSouthwindConfiguration(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            sb.Include<ApplicationConfigurationDN>();
            Configuration = sb.GlobalLazy<ApplicationConfigurationDN>(
                () => Database.Query<ApplicationConfigurationDN>().Single(a=>a.Environment == Settings.Default.Environment),
                new InvalidateWith(typeof(ApplicationConfigurationDN)));

            new Graph<ApplicationConfigurationDN>.Execute(ApplicationConfigurationOperation.Save)
            {
                AllowsNew = true,
                Lite = false,
                Execute = (e, _) => { },
            }.Register();

            dqm.RegisterQuery(typeof(ApplicationConfigurationDN), () =>
                from s in Database.Query<ApplicationConfigurationDN>()
                select new
                {
                    Entity = s.ToLite(),
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
            CacheLogic.CacheTable<ShipperDN>(sb);
        }

        public static void SetLogDatabase(Schema schema, DatabaseName logDatabaseName)
        {
            schema.Table<OperationLogDN>().ToDatabase(logDatabaseName);
            schema.Table<ExceptionDN>().ToDatabase(logDatabaseName);
        }
    }
}
