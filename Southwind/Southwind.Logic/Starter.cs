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
using Signum.Engine.Extensions.Chart;
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

namespace Southwind.Logic
{

    //Starts-up the engine for Southwind Entities, used by Web and Load Application
    public static class Starter
    {
        public static void Start(string connectionString)
        {
            SchemaBuilder sb = new SchemaBuilder();
            DynamicQueryManager dqm = new DynamicQueryManager();
            sb.Schema.ForceCultureInfo = CultureInfo.InvariantCulture;

            sb.Schema.Settings.OverrideAttributes((UserDN ua) => ua.Related, new ImplementedByAttribute(typeof(EmployeeDN)));
            sb.Schema.Settings.OverrideAttributes((UserQueryDN uq) => uq.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideAttributes((UserChartDN uc) => uc.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            
            ConnectionScope.Default = new Connection(connectionString, sb.Schema, dqm);

            OperationLogic.Start(sb, dqm);

            EmailLogic.Start(sb, dqm);

            AuthLogic.Start(sb, dqm, "System", null);
            
            ResetPasswordRequestLogic.Start(sb, dqm);
            AuthLogic.StartAllModules(sb, dqm, typeof(IServerSouthwind));
            UserTicketLogic.Start(sb, dqm); 

            ChartLogic.Start(sb, dqm);
            UserQueryLogic.Start(sb, dqm);
            ChartLogic.Start(sb, dqm);
            
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
        }
    }
}
