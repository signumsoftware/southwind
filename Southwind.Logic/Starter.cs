using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Engine;
using Signum.Engine.DynamicQuery;
using Southwind.Entities;
using System.Globalization;
using Signum.Engine.Operations;
using Signum.Engine.Authorization;
using Signum.Engine.Chart;
using Signum.Engine.Reports;
using Signum.Entities.Authorization;
using Southwind.Services;
using Signum.Engine.Basics;
using Signum.Engine.Mailing;
using Signum.Entities.Chart;
using Signum.Entities.Reports;
using Signum.Entities.ControlPanel;
using Signum.Entities.UserQueries;
using Signum.Engine.UserQueries;
using Signum.Engine.ControlPanel;
using Signum.Utilities.ExpressionTrees;
using Signum.Utilities;
using Signum.Engine.Exceptions;
using Signum.Engine.Disconnected;
using Signum.Entities.Disconnected;
using Signum.Entities.Exceptions;
using Signum.Entities.Mailing;
using Signum.Entities.Operations;
using System.Linq.Expressions;

namespace Southwind.Logic
{

    //Starts-up the engine for Southwind Entities, used by Web and Load Application
    public static class Starter
    {
        public static void Start(string connectionString)
        {
            SchemaBuilder sb = new SchemaBuilder(DBMS.SqlServer2008);
            sb.Schema.Version = typeof(Starter).Assembly.GetName().Version;
            sb.Schema.ForceCultureInfo = CultureInfo.InvariantCulture;
            sb.Schema.Settings.OverrideAttributes((UserDN ua) => ua.Related, new ImplementedByAttribute(typeof(EmployeeDN)));
            sb.Schema.Settings.OverrideAttributes((UserQueryDN uq) => uq.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideAttributes((UserChartDN uc) => uc.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideAttributes((ControlPanelDN cp) => cp.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));

            DynamicQueryManager dqm = new DynamicQueryManager();

            Connector.Default = new SqlConnector(connectionString, sb.Schema, dqm);

            OperationLogic.Start(sb, dqm);

            EmailLogic.Start(sb, dqm);

            AuthLogic.Start(sb, dqm, "System", null);
            
            ResetPasswordRequestLogic.Start(sb, dqm);
            AuthLogic.StartAllModules(sb, dqm, typeof(IServerSouthwind));
            UserTicketLogic.Start(sb, dqm); 

            QueryLogic.Start(sb);
            UserQueryLogic.Start(sb, dqm);
            UserQueryLogic.RegisterUserTypeCondition(sb, SouthwindGroups.UserEntities);
            UserQueryLogic.RegisterRoleTypeCondition(sb, SouthwindGroups.RoleEntities);
            ChartLogic.Start(sb, dqm);
            ChartLogic.RegisterUserTypeCondition(sb, SouthwindGroups.UserEntities);
            ChartLogic.RegisterRoleTypeCondition(sb, SouthwindGroups.RoleEntities);
            ControlPanelLogic.Start(sb, dqm);
            ControlPanelLogic.RegisterUserTypeCondition(sb, SouthwindGroups.UserEntities);
            ControlPanelLogic.RegisterRoleTypeCondition(sb, SouthwindGroups.RoleEntities);

            ExceptionLogic.Start(sb, dqm);

            sb.Include<NoteDN>();
            dqm[typeof(NoteDN)] = (from a in Database.Query<NoteDN>()
                                   select new
                                   {
                                       Entity = a.ToLite(),
                                       a.Id,
                                       a.Text,
                                       a.Target
                                   }).ToDynamic();
            
            sb.Include<AlertDN>();
            var alertExpr = Linq.Expr((AlertDN a) => new
            {
                Entity = a.ToLite(),
                a.Id,
                a.AlertDate,
                Text = a.Text.Etc(100),
                a.CheckDate,
                Target = a.Entity
            });
            dqm[typeof(AlertDN)] = Database.Query<AlertDN>().Select(alertExpr).ToDynamic();
            dqm[AlertQueries.NotAttended] = Database.Query<AlertDN>().Where(a => a.NotAttended).Select(alertExpr).ToDynamic();
            dqm[AlertQueries.Attended] = Database.Query<AlertDN>().Where(a => a.Attended).Select(alertExpr).ToDynamic();
            dqm[AlertQueries.Future] = Database.Query<AlertDN>().Where(a => a.Future).Select(alertExpr).ToDynamic();

            EmployeeLogic.Start(sb, dqm);
            ProductLogic.Start(sb, dqm);
            CustomerLogic.Start(sb, dqm); 
            OrderLogic.Start(sb, dqm);

            TypeConditionLogic.Register<OrderDN>(SouthwindGroups.UserEntities,
                o => o.Employee.RefersTo((EmployeeDN)UserDN.Current.Related));

            TypeConditionLogic.Register<EmployeeDN>(SouthwindGroups.UserEntities,
                e => e == (EmployeeDN)UserDN.Current.Related);

            TypeConditionLogic.Register<OrderDN>(SouthwindGroups.CurrentCompany,
                o => o.Customer == CompanyDN.Current);

            TypeConditionLogic.Register<OrderDN>(SouthwindGroups.CurrentPerson,
               o => o.Customer == PersonDN.Current);

            DisconnectedLogic.Start(sb, dqm);

            SetupDisconnectedStrategies(sb);
        }

        private static void SetupDisconnectedStrategies(SchemaBuilder sb)
        {
            //Signum.Entities
            DisconnectedLogic.Register<TypeDN>(Download.All, Upload.None);
            
            //Signum.Entities.Authorization
            DisconnectedLogic.Register<UserDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RoleDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<ResetPasswordRequestDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<RuleTypeDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RulePropertyDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleFacadeMethodDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleQueryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RuleOperationDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<PermissionDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RulePermissionDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<UserTicketDN>(Download.None, Upload.None);
            
            //Signum.Entities.Basics
            DisconnectedLogic.Register<TypeConditionNameDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<PropertyDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<FacadeMethodDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<QueryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<NoteDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<AlertDN>(Download.None, Upload.None);
            
            //Signum.Entities.Chart
            DisconnectedLogic.Register<ChartColorDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<UserChartDN>(Download.All, Upload.New);
            
            //Signum.Entities.ControlPanel
            DisconnectedLogic.Register<ControlPanelDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserChartPartDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<UserQueryPartDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<CountSearchControlPartDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<LinkListPartDN>(Download.None, Upload.None);
            
            //Signum.Entities.Disconnected
            DisconnectedLogic.Register<DisconnectedMachineDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<DownloadStatisticsDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<UploadStatisticsDN>(Download.None, Upload.None);

            //Signum.Entities.Mailing
            DisconnectedLogic.Register<EmailMessageDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailTemplateDN>(Download.None, Upload.None);
            DisconnectedLogic.Register<EmailPackageDN>(Download.None, Upload.None);
            
            //Signum.Entities.Operations
            DisconnectedLogic.Register<OperationDN>(Download.All, Upload.None);
            Expression<Func<OperationLogDN, bool>> operationLogCondition = ol =>
             ol.Target.RuntimeType == typeof(EmployeeDN) ||
             ol.Target.RuntimeType == typeof(ProductDN) ||
             ol.Target.RuntimeType == typeof(OrderDN) && ((OrderDN)ol.Target.Entity).Employee.RefersTo(EmployeeDN.Current) ||
             ol.Target.RuntimeType == typeof(PersonDN) && Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == ((PersonDN)ol.Target.Entity)) ||
             ol.Target.RuntimeType == typeof(CompanyDN) && Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == ((CompanyDN)ol.Target.Entity));
            
            DisconnectedLogic.Register<OperationLogDN>(operationLogCondition, Upload.New);
            
            //Signum.Entities.Exceptions
            DisconnectedLogic.Register<ExceptionDN>(e => Database.Query<OperationLogDN>().Where(operationLogCondition).Any(a => a.Exception.RefersTo(e)), Upload.None);
            
            //Signum.Entities.UserQueries
            DisconnectedLogic.Register<UserQueryDN>(Download.All, Upload.New);
            
            //Southwind.Entities
            DisconnectedLogic.Register<EmployeeDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<TerritoryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<RegionDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<ProductDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<SupplierDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<CategoryDN>(Download.All, Upload.None);
            DisconnectedLogic.Register<PersonDN>(p => Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == p), Upload.New);
            DisconnectedLogic.Register<CompanyDN>(p => Database.Query<OrderDN>().Any(o => o.Employee.RefersTo(EmployeeDN.Current) && o.Customer == p), Upload.New);
            DisconnectedLogic.Register<OrderDN>(o => o.Employee.RefersTo(EmployeeDN.Current));
            DisconnectedLogic.Register<ShipperDN>(Download.All, Upload.None);
        }
    }
}
