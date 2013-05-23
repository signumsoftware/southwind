using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Services;
using Signum.Entities.Disconnected;
using Signum.Utilities;

namespace Southwind.Services
{
    //Defines the WPF contract between client and server applications
    [ServiceContract(SessionMode = SessionMode.Required)]
    public interface IServerSouthwind : IBaseServer, IDynamicQueryServer, IOperationServer,
        ILoginServer, IProcessServer, IQueryServer, IChartServer, IExcelReportServer, IUserQueryServer, IControlPanelServer, IUserAssetsServer,
        IProfilerServer, IQueryAuthServer, IPropertyAuthServer, ITypeAuthServer, IPermissionAuthServer, IOperationAuthServer,
        IDisconnectedServer
    {

    }


    [ServiceContract(SessionMode = SessionMode.NotAllowed)]
    public interface IServerSouthwindTransfer : IDisconnectedTransferServer
    {

    }

    [DescriptionOptions(DescriptionOptions.Members)]
    public enum SouthwindGroup
    {
        UserEntities,
        CurrentCompany,
        CurrentPerson,
        RoleEntities
    }
}
