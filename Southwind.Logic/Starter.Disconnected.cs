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

namespace Southwind.Logic
{
    public partial class Starter
    {
        private static void SetupDisconnectedStrategies(SchemaBuilder sb)
        {
            //Signum.Entities
            DisconnectedLogic.Register<TypeDN>(Download.Replace, Upload.None);

            //Signum.Entities.Authorization
            DisconnectedLogic.Register<UserDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RoleDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<ResetPasswordRequestDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<RuleTypeDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RulePropertyDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleQueryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleOperationDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<PermissionSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<RulePermissionDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<SessionLogDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserTicketDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<LastAuthRulesImportDN>(Download.None, Upload.None);

            //Signum.Entities.Basics
            DisconnectedLogic.Register<TypeConditionSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<PropertyRouteDN>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<QueryDN>(Download.Replace, Upload.New);
            
            //Signum.Entities.Notes
            DisconnectedLogic.Register<NoteDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<NoteTypeDN>(Download.Replace, Upload.None);
            
            //Signum.Entities.Alerts
            DisconnectedLogic.Register<AlertDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<AlertTypeDN>(Download.Replace, Upload.None);

            //Signum.Entities.Chart
            DisconnectedLogic.Register<ChartColorDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<UserChartDN>(Download.All, Upload.New); 
            DisconnectedLogic.Register<ChartScriptDN>(Download.All, Upload.New);

            //Signum.Entities.Files
            DisconnectedLogic.Register<FileDN>(Download.All, Upload.New);



            //Signum.Entities.ControlPanel
            DisconnectedLogic.Register<DashboardDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserChartPartDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserQueryPartDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<CountSearchControlPartDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<LinkListPartDN>(Download.None, Upload.None);

            //Signum.Entities.Disconnected
            DisconnectedLogic.Register<DisconnectedMachineDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<DisconnectedExportDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<DisconnectedImportDN>(Download.None, Upload.None);

            //Signum.Entities.Files
            DisconnectedLogic.Register<FilePathDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<FileTypeSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<FileRepositoryDN>(Download.None, Upload.None);

            //Signum.Entities.Mailing
            DisconnectedLogic.Register<EmailMessageDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailTemplateDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailPackageDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailMasterTemplateDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<SmtpConfigurationDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<SystemEmailDN>(Download.Replace, Upload.None);
          
            //Signum.Entities.Translation
            DisconnectedLogic.Register<CultureInfoDN>(Download.All, Upload.None);

            //Signum.Entities.Operations
            DisconnectedLogic.Register<OperationSymbol>(Download.Replace, Upload.None);
            Expression<Func<OperationLogDN, bool>> operationLogCondition = ol =>
             ol.Target.EntityType == typeof(EmployeeDN) ||
             ol.Target.EntityType == typeof(ProductDN) ||
             ol.Target.EntityType == typeof(OrderDN) && ((OrderDN)ol.Target.Entity).Employee.RefersTo(EmployeeDN.Current) ||
             ol.Target.EntityType == typeof(PersonDN) && Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == ((PersonDN)ol.Target.Entity)) ||
             ol.Target.EntityType == typeof(CompanyDN) && Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == ((CompanyDN)ol.Target.Entity));

            DisconnectedLogic.Register<OperationLogDN>(operationLogCondition, Upload.New);

            //Signum.Entities.Processes
            DisconnectedLogic.Register<ProcessAlgorithmSymbol>(Download.Replace, Upload.None);
            DisconnectedLogic.Register<ProcessDN>(Download.None, Upload.New);
            DisconnectedLogic.Register<PackageDN>(Download.None, Upload.New);
            DisconnectedLogic.Register<PackageOperationDN>(Download.None, Upload.New);
            DisconnectedLogic.Register<PackageLineDN>(Download.None, Upload.New);
            DisconnectedLogic.Register<ProcessExceptionLineDN>(Download.None, Upload.New);

            //Signum.Entities.Exceptions
            DisconnectedLogic.Register<ExceptionDN>(e => Database.Query<OperationLogDN>().Any(ol => operationLogCondition.Evaluate(ol) && ol.Exception.RefersTo(e)), Upload.New);
            
            //Signum.Entities.UserQueries
            DisconnectedLogic.Register<UserQueryDN>(Download.All, Upload.New);

            //Southwind.Entities
            DisconnectedLogic.Register<EmployeeDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<TerritoryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RegionDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<ProductDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<SupplierDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<CategoryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<OrderDN>(o => o.Employee.RefersTo(EmployeeDN.Current));
            DisconnectedLogic.Register<PersonDN>(p => 
                Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == p), 
                Upload.New);
            DisconnectedLogic.Register<CompanyDN>(p => 
                Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == p), 
                Upload.New);
            
            DisconnectedLogic.Register<ShipperDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<ApplicationConfigurationDN>(Download.All, Upload.None);
        }
    }
}
