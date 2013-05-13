using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Services;
using Southwind.Services;
using System.Reflection;
using Signum.Engine.Exceptions;
using Signum.Utilities;
using Signum.Entities.Disconnected;
using Signum.Entities;
using Signum.Engine.Disconnected;
using Signum.Engine.Maps;
using Signum.Engine;
using Signum.Engine.Authorization;
using System.ServiceModel;
using Signum.Entities.Authorization;
using Signum.Engine.Basics;

namespace Southwind.Local
{
    class ServerSouthwindLocal : ServerExtensions, IServerSouthwind
    {
        protected override T Return<T>(MethodBase mi, string description, Func<T> function, bool checkLogin = true)
        {
            try
            {
                using (ScopeSessionFactory.OverrideSession(session))
                {
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
            throw NotAvailableOffline();
        }

        public Lite<DisconnectedMachineDN> GetDisconnectedMachine(string machineName)
        {
            return Return(MethodInfo.GetCurrentMethod(), () =>
              DisconnectedLogic.GetDisconnectedMachine(machineName));
        }

        public Dictionary<Type, StrategyPair> GetStrategyPairs()
        {
            return Return(MethodInfo.GetCurrentMethod(), () =>
                DisconnectedLogic.GetStrategyPairs());
        }

        public DisconnectedImportDN GetUploadEstimation(Lite<DisconnectedMachineDN> machine)
        {
            throw NotAvailableOffline();
        }

        public void SkipExport(Lite<DisconnectedMachineDN> machine)
        {
            throw NotAvailableOffline();
        }

        public void ConnectAfterFix(Lite<DisconnectedMachineDN> machine)
        {
            throw NotAvailableOffline();
        }

        private static InvalidOperationException NotAvailableOffline()
        {
            throw new InvalidOperationException("Operation not available while offline");
        }
    }

    class ServerSouthwindTransferLocal : IServerSouthwindTransfer
    {
        public Lite<DisconnectedExportDN> BeginExportDatabase(Lite<UserDN> user, Lite<DisconnectedMachineDN> machine)
        {
            throw NotAvailableOffline();
        }

        public FileMessage EndExportDatabase(DownloadDatabaseRequests request)
        {
            throw NotAvailableOffline();
        }

        public UploadDatabaseResult UploadDatabase(UploadDatabaseRequest request)
        {
            throw NotAvailableOffline();
        }

        private static InvalidOperationException NotAvailableOffline()
        {
            throw new InvalidOperationException("Operation not available while offline");
        }
    }
}
