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
using Signum.Engine.ViewLog;
using System.Collections.Generic;
using Signum.Entities.ViewLog;
using Signum.Engine.Help;

namespace Southwind.Logic
{

    //Starts-up the engine for Southwind Entities, used by Web and Load Application
    public static partial class Starter
    {
        public static ResetLazy<ApplicationConfigurationDN> Configuration;


        public static void Start(string connectionString)
        {
            string logDatabase = Connector.TryExtractDatabaseNameWithPostfix(ref connectionString, "_Log");

            SchemaBuilder sb = new SchemaBuilder();
            sb.Schema.Version = typeof(Starter).Assembly.GetName().Version;
            sb.Schema.ForceCultureInfo = CultureInfo.GetCultureInfo("en-US");

            MixinDeclarations.Register<UserDN, UserEmployeeMixin>();
            MixinDeclarations.Register<ProcessDN, UserProcessSessionMixin>();

            OverrideAttributes(sb);

            SetupDisconnectedStrategies(sb);

            DynamicQueryManager dqm = new DynamicQueryManager();

            Connector.Default = new SqlConnector(connectionString, sb.Schema, dqm, SqlServerVersion.SqlServer2012);

            CacheLogic.Start(sb);

            TypeLogic.Start(sb, dqm); 

            OperationLogic.Start(sb, dqm);

            CultureInfoLogic.Start(sb, dqm);
            FilePathLogic.Start(sb, dqm);
            EmailLogic.Start(sb, dqm, () => Configuration.Value.Email, () => null);

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
            ViewLogLogic.Start(sb, dqm, new HashSet<Type> { typeof(UserQueryDN), typeof(UserChartDN), typeof(DashboardDN) }); 

            ExceptionLogic.Start(sb, dqm);

            SMSLogic.Start(sb, dqm, null, () => Configuration.Value.Sms);
            SMSLogic.RegisterPhoneNumberProvider<PersonDN>(p => p.Phone, p => null);
            SMSLogic.RegisterDataObjectProvider((PersonDN p) => new { p.FirstName, p.LastName, p.Title, p.DateOfBirth });
            SMSLogic.RegisterPhoneNumberProvider<CompanyDN>(p => p.Phone, p => null);

            NoteLogic.Start(sb, dqm, typeof(UserDN), /*Note*/typeof(OrderDN));
            AlertLogic.Start(sb, dqm, typeof(UserDN), /*Alert*/typeof(OrderDN));
            FileLogic.Start(sb, dqm);

            TranslationLogic.Start(sb, dqm);
            TranslatedInstanceLogic.Start(sb, dqm, "en");

            HelpLogic.Start(sb, dqm);

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

            if (logDatabase.HasText())
                SetLogDatabase(sb.Schema, new DatabaseName(null, logDatabase));
        }

        private static void OverrideAttributes(SchemaBuilder sb)
        {
            sb.Schema.Settings.FieldAttributes((ExceptionDN ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((OperationLogDN ua) => ua.User).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((UserQueryDN uq) => uq.Owner).Replace(new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.FieldAttributes((UserChartDN uc) => uc.Owner).Replace(new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.FieldAttributes((DashboardDN cp) => cp.Owner).Replace(new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.FieldAttributes((ViewLogDN cp) => cp.User).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((NoteDN n) => n.CreatedBy).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((AlertDN a) => a.CreatedBy).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((AlertDN a) => a.AttendedBy).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((ProcessDN cp) => cp.Data).Replace(new ImplementedByAttribute(typeof(PackageDN), typeof(PackageOperationDN)));
            sb.Schema.Settings.FieldAttributes((PackageLineDN cp) => cp.Package).Replace(new ImplementedByAttribute(typeof(PackageDN), typeof(PackageOperationDN)));
            sb.Schema.Settings.FieldAttributes((ProcessExceptionLineDN cp) => cp.Line).Replace(new ImplementedByAttribute(typeof(PackageLineDN)));
            sb.Schema.Settings.FieldAttributes((ProcessDN s) => s.Mixin<UserProcessSessionMixin>().User).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((EmailMessageDN em) => em.From.EmailOwner).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((EmailMessageDN em) => em.Recipients.First().EmailOwner).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((SmtpConfigurationDN sc) => sc.DefaultFrom.EmailOwner).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((SmtpConfigurationDN sc) => sc.AditionalRecipients.First().EmailOwner).Replace(new ImplementedByAttribute(typeof(UserDN)));
            sb.Schema.Settings.FieldAttributes((ScheduledTaskLogDN a) => a.User).Replace(new ImplementedByAttribute(typeof(UserDN)));
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
