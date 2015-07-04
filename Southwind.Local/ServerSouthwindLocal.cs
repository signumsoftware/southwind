using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Services;
using Southwind.Services;
using System.Reflection;
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
using Signum.Entities.Basics;

namespace Southwind.Local
{
    class ServerSouthwindLocal : ServerExtensions, IServerSouthwind
    {
        protected override T Return<T>(MethodBase mi, string description, Func<T> function)
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

                throw;
            }
            finally
            {
                Statics.CleanThreadContextAndAssert();
            }
        }

        public DisconnectedExportEntity GetDownloadEstimation(Lite<DisconnectedMachineEntity> machine)
        {
            throw NotAvailableOffline();
        }

        public Lite<DisconnectedMachineEntity> GetDisconnectedMachine(string machineName)
        {
            return Return(MethodInfo.GetCurrentMethod(), () =>
              DisconnectedLogic.GetDisconnectedMachine(machineName));
        }

        public Dictionary<Type, StrategyPair> GetStrategyPairs()
        {
            return Return(MethodInfo.GetCurrentMethod(), () =>
                DisconnectedLogic.GetStrategyPairs());
        }

        public DisconnectedImportEntity GetUploadEstimation(Lite<DisconnectedMachineEntity> machine)
        {
            throw NotAvailableOffline();
        }

        public void SkipExport(Lite<DisconnectedMachineEntity> machine)
        {
            throw NotAvailableOffline();
        }

        public void ConnectAfterFix(Lite<DisconnectedMachineEntity> machine)
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
        public Lite<DisconnectedExportEntity> BeginExportDatabase(Lite<IUserEntity> user, Lite<DisconnectedMachineEntity> machine)
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
