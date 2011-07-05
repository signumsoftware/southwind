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

            sb.Schema.Settings.OverrideFieldAttributes((UserDN ua) => ua.Related, new ImplementedByAttribute(typeof(EmployeeDN)));
            sb.Schema.Settings.OverrideFieldAttributes((UserQueryDN uq) => uq.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            sb.Schema.Settings.OverrideFieldAttributes((UserChartDN uc) => uc.Related, new ImplementedByAttribute(typeof(UserDN), typeof(RoleDN)));
            
            ConnectionScope.Default = new Connection(connectionString, sb.Schema, dqm);

            OperationLogic.Start(sb, dqm);

            EmailLogic.Start(sb, dqm);

            AuthLogic.Start(sb, dqm, "System", null);
            
            ResetPasswordRequestLogic.Start(sb, dqm);
            AuthLogic.StartAllModules(sb, dqm, typeof(IServerSouthwind));
            UserTicketLogic.Start(sb, dqm); 
            EntityGroupAuthLogic.Start(sb, false); 

            ChartLogic.Start(sb, dqm);
            UserQueryLogic.Start(sb, dqm);
            
            EmployeeLogic.Start(sb, dqm);
            ProductLogic.Start(sb, dqm);
            CustomerLogic.Start(sb, dqm); 
            OrderLogic.Start(sb, dqm);


            //Starter.Start method

            EntityGroupLogic.Register<OrderDN>(SouthwindGroups.UserEntities, 
                o => o.Employee.RefersTo((EmployeeDN)UserDN.Current.Related));

            EntityGroupLogic.Register<EmployeeDN>(SouthwindGroups.UserEntities,
                e => e == (EmployeeDN)UserDN.Current.Related);

            EntityGroupLogic.Register<OrderDN>(SouthwindGroups.CurrentCompany,
                o => o.Customer == CompanyDN.Current,
                o => o.Customer is CompanyDN);

            EntityGroupLogic.Register<OrderDN>(SouthwindGroups.CurrentPerson,
               o => o.Customer == PersonDN.Current, 
               o => o.Customer is PersonDN); 

        }
    }
}
