using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.Reflection;
using Signum.Entities;
using Signum.Engine;
using Signum.Entities.DynamicQuery;
using Signum.Engine.Maps;
using Signum.Engine.DynamicQuery;
using Signum.Entities.Basics;
using Signum.Services;
using Southwind.Services;
using Signum.Entities.Authorization;
using Signum.Engine.Authorization;
using Signum.Entities.Disconnected;
using Signum.Engine.Disconnected;
using Signum.Utilities;
using Signum.Engine.Exceptions;

namespace Southwind.Web
{
    public class ServerSouthwind : ServerExtensions, IServerSouthwind
    {
        protected override T Return<T>(MethodBase mi, string description, Func<T> function)
        {
            try
            {
                using (ScopeSessionFactory.OverrideSession(session))
                using (ExecutionContext.Scope(GetDefaultExecutionContext(mi, description)))
                {
                    FacadeMethodAuthLogic.AuthorizeAccess((MethodInfo)mi);

                    return function();
                }
            }
            catch (Exception e)
            {
                e.LogException(el =>
                {
                    el.ControllerName = GetType().Name;
                    el.ActionName = mi.Name;
                    el.QueryString = description;
                    el.Version = Schema.Current.Version.ToString();
                });
                throw new FaultException(e.Message);
            }
            finally
            {
                Statics.CleanThreadContextAndAssert();
            }
        }

        public DisconnectedExportDN GetDownloadEstimation(Lite<DisconnectedMachineDN> machine)
        {
            return Return(MethodInfo.GetCurrentMethod(), () => DisconnectedLogic.GetDownloadEstimation(machine)); 
        }

        public Lite<DisconnectedMachineDN> GetDisconnectedMachine(string machineName)
        {
            return Return(MethodInfo.GetCurrentMethod(), () => DisconnectedLogic.GetDisconnectedMachine(machineName));
        }

        public DisconnectedImportDN GetUploadEstimation(Lite<DisconnectedMachineDN> machine)
        {
            return Return(MethodInfo.GetCurrentMethod(), () => DisconnectedLogic.GetUploadEstimation(machine));
        }

        public Dictionary<Type, StrategyPair> GetStrategyPairs()
        {
            return Return(MethodInfo.GetCurrentMethod(), () =>
                DisconnectedLogic.GetStrategyPairs());
        }
    }
}
