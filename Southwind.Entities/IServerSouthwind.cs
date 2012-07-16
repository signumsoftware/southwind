using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Services;
using Signum.Entities.Disconnected;

namespace Southwind.Services
{
    //Defines the WPF contract between client and server applications
    [ServiceContract(SessionMode = SessionMode.Required)]
    public interface IServerSouthwind : IBaseServer, IDynamicQueryServer, ILoginServer, IOperationServer, IQueryServer, IChartServer, IExcelReportServer, IUserQueryServer, IControlPanelServer,
        IQueryAuthServer, IPropertyAuthServer, ITypeAuthServer, IFacadeMethodAuthServer, IPermissionAuthServer, IOperationAuthServer,
        IDisconnectedServer
    {

    }


    [ServiceContract(SessionMode = SessionMode.NotAllowed)]
    public interface IServerSouthwindTransfer : IDisconnectedTransferServer
    {

    }

    public enum SouthwindGroups
    {
        UserEntities,
        CurrentCompany,
        CurrentPerson,
        RoleEntities
    }
}
