using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Entities.Disconnected;
using Signum.Entities;
using Signum.Engine.Disconnected;
using Signum.Entities.Authorization;
using Signum.Entities.Basics;
using Signum.Entities.Chart;
using Signum.Entities.Dashboard;
using Signum.Entities.Mailing;
using Southwind.Entities;
using Signum.Entities.UserQueries;
using Signum.Engine;
using System.Linq.Expressions;
using Signum.Utilities;
using System.Data.Common;
using Signum.Engine.Basics;
using Signum.Engine.Authorization;
using Signum.Engine.Operations;
using Signum.Entities.Files;
using Signum.Entities.Processes;
using Signum.Entities.Notes;
using Signum.Entities.Alerts;
using Signum.Entities.Translation;
using Signum.Entities.UserAssets;
using Signum.Entities.Scheduler;
using Signum.Entities.SMS;
using Signum.Entities.ViewLog;
using Signum.Entities.Help;
using Signum.Entities.Word;
using Signum.Entities.Migrations;

namespace Southwind.Logic
{
    public partial class Starter
    {
        private static void SetupDisconnectedStrategies(SchemaBuilder sb)
        {
            //Signum.Entities
            DisconnectedLogic.Register<TypeEntity>(Download.Replace, Upload.None);

            //Signum.Entities.Authorization
            DisconnectedLogic.Register<UserEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<RoleEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<ResetPasswordRequestEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<RuleTypeEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<RulePropertyEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleQueryEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleOperationEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<PermissionSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<RulePermissionEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<SessionLogEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserTicketEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<LastAuthRulesImportEntity>(Download.None, Upload.None);

            //Signum.Entities.Basics
            DisconnectedLogic.Register<TypeConditionSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<PropertyRouteEntity>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<QueryEntity>(Download.Replace, Upload.New);
            
            //Signum.Entities.Notes
            DisconnectedLogic.Register<NoteEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<NoteTypeEntity>(Download.Replace, Upload.None);
            
            //Signum.Entities.Alerts
            DisconnectedLogic.Register<AlertEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<AlertTypeEntity>(Download.Replace, Upload.None);

            //Signum.Entities.Chart
            DisconnectedLogic.Register<ChartColorEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<UserChartEntity>(Download.All, Upload.New); 
            DisconnectedLogic.Register<ChartScriptEntity>(Download.All, Upload.New);

            //Signum.Entities.Files
            DisconnectedLogic.Register<FileEntity>(Download.All, Upload.New);

            //Signum.Entities.Help
            DisconnectedLogic.Register<EntityHelpEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<NamespaceHelpEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<AppendixHelpEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<QueryHelpEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<OperationHelpEntity>(Download.None, Upload.None);

            //Signum.Entities.ControlPanel
            DisconnectedLogic.Register<DashboardEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserChartPartEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserQueryPartEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<CountSearchControlPartEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<LinkListPartEntity>(Download.None, Upload.None);

            //Signum.Entities.Disconnected
            DisconnectedLogic.Register<DisconnectedMachineEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<DisconnectedExportEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<DisconnectedImportEntity>(Download.None, Upload.None);

            //Signum.Entities.Files
            DisconnectedLogic.Register<FilePathEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<FileTypeSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<FileRepositoryEntity>(Download.None, Upload.None);

            //Signum.Entities.Mailing
            DisconnectedLogic.Register<EmailMessageEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailTemplateEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailPackageEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailMasterTemplateEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<SmtpConfigurationEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<SystemEmailEntity>(Download.Replace, Upload.None);

            //Signum.Entities.Migrations
            DisconnectedLogic.Register<SqlMigrationEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<CSharpMigrationEntity>(Download.All, Upload.None);

            //Signum.Entities.Translation
            DisconnectedLogic.Register<CultureInfoEntity>(Download.All, Upload.None);

            //Signum.Entities.Operations
            DisconnectedLogic.Register<OperationSymbol>(Download.Replace, Upload.None);
            Expression<Func<OperationLogEntity, bool>> operationLogCondition = ol =>
             ol.Target.EntityType == typeof(OrderEntity) && ((OrderEntity)ol.Target.Entity).Employee.RefersTo(EmployeeEntity.Current) ||
             ol.Target.EntityType == typeof(PersonEntity) && Database.Query<OrderEntity>().Any(o => o.Employee.RefersTo(EmployeeEntity.Current) && o.Customer == ((PersonEntity)ol.Target.Entity)) ||
             ol.Target.EntityType == typeof(CompanyEntity) && Database.Query<OrderEntity>().Any(o => o.Employee.RefersTo(EmployeeEntity.Current) && o.Customer == ((CompanyEntity)ol.Target.Entity) || 
             ol.Target.EntityType == typeof(EmployeeEntity) ||
             ol.Target.EntityType == typeof(ProductEntity));

            DisconnectedLogic.Register<OperationLogEntity>(operationLogCondition, Upload.New);

            //Signum.Entities.Processes
            DisconnectedLogic.Register<ProcessAlgorithmSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<ProcessEntity>(Download.None, Upload.New);
            DisconnectedLogic.Register<PackageEntity>(Download.None, Upload.New);
            DisconnectedLogic.Register<PackageOperationEntity>(Download.None, Upload.New);
            DisconnectedLogic.Register<PackageLineEntity>(Download.None, Upload.New);
            DisconnectedLogic.Register<ProcessExceptionLineEntity>(Download.None, Upload.New);

            //Signum.Entities.Scheduler
            DisconnectedLogic.Register<SimpleTaskSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<ScheduledTaskEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<ScheduleRuleDailyEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<ScheduleRuleWeeklyEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<ScheduleRuleWeekDaysEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<HolidayCalendarEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<ScheduleRuleMinutelyEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<ScheduleRuleHourlyEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<ScheduledTaskLogEntity>(Download.None, Upload.None);

            
          //Signum.Entities.Word
          DisconnectedLogic.Register<WordTemplateEntity>(Download.All, Upload.None);
          DisconnectedLogic.Register<SystemWordTemplateEntity>(Download.All, Upload.None);
          DisconnectedLogic.Register<WordReportLogEntity>(Download.None, Upload.New);

            //Signum.Entities.SMS
            DisconnectedLogic.Register<SMSMessageEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<SMSTemplateEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<SMSSendPackageEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<SMSUpdatePackageEntity>(Download.None, Upload.None);

            //Signum.Entities.Translation
            DisconnectedLogic.Register<TranslatorUserEntity>(Download.None, Upload.None);
            DisconnectedLogic.Register<TranslatedInstanceEntity>(Download.None, Upload.None);

            //Signum.Entities.Exceptions
            DisconnectedLogic.Register<ExceptionEntity>(e => Database.Query<OperationLogEntity>()
                .Any(ol => operationLogCondition.Evaluate(ol) && ol.Exception.RefersTo(e)), Upload.New);

            //Signum.Entities.ViewLog
            DisconnectedLogic.Register<ViewLogEntity>(Download.None, Upload.New);

            //Signum.Entities.UserQueries
            DisconnectedLogic.Register<UserQueryEntity>(Download.All, Upload.New);

            //Southwind.Entities
            DisconnectedLogic.Register<EmployeeEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<TerritoryEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<RegionEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<ProductEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<SupplierEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<CategoryEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<OrderEntity>(o => o.Employee.RefersTo(EmployeeEntity.Current));
            DisconnectedLogic.Register<PersonEntity>(p => 
                Database.Query<OrderEntity>().Any(o => o.Employee.RefersTo(EmployeeEntity.Current) && o.Customer == p), 
                Upload.New);
            DisconnectedLogic.Register<CompanyEntity>(p => 
                Database.Query<OrderEntity>().Any(o => o.Employee.RefersTo(EmployeeEntity.Current) && o.Customer == p), 
                Upload.New);
            
            DisconnectedLogic.Register<ShipperEntity>(Download.All, Upload.None);
            DisconnectedLogic.Register<ApplicationConfigurationEntity>(Download.All, Upload.None);
        }
    }
}
