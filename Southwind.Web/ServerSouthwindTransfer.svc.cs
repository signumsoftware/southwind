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
using Signum.Engine.Disconnected;
using Signum.Entities.Disconnected;
using System.IO;
using Signum.Utilities;
using Signum.Engine.Exceptions;

namespace Southwind.Web
{
    public class ServerSouthwindTransfer : IServerSouthwindTransfer
    {
        protected T Return<T>(UserDN user, MethodBase mi, string description, Func<T> function)
        {
            try
            {
                using (AuthLogic.UserSession(user))
                using (ExecutionContext.Scope(null))
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

        public Lite<DownloadStatisticsDN> BeginExportDatabase(Lite<DisconnectedMachineDN> machine)
        {
            return Return(GetUser(machine), MethodInfo.GetCurrentMethod(), null, () =>
                DisconnectedLogic.ExportManager.BeginExportDatabase(machine.Retrieve()));
        }

        public FileMessage EndExportDatabase(DownloadDatabaseRequests requests)
        {
            var stats = requests.DownloadStatistics;

            return Return(GetUser(stats), MethodInfo.GetCurrentMethod(), null, () =>
            {
                string fileName = DisconnectedLogic.ExportManager.BackupFileName(requests.DownloadStatistics.Retrieve().Machine.Retrieve(), requests.DownloadStatistics);
                var fi = new FileInfo(fileName);

                return new FileMessage
                {
                    FileName = fi.Name,
                    Length = fi.Length,
                    Stream = fi.OpenRead(),
                    OnDisposing = () => File.Delete(fileName),
                };
            });
        }

        static UserDN GetUser(Lite<DisconnectedMachineDN> machine)
        {
            using (AuthLogic.Disable())
                return machine.Retrieve().User;
        }

        static UserDN GetUser(Lite<DownloadStatisticsDN> stats)
        {
            using (AuthLogic.Disable())
                return stats.Retrieve().Machine.Retrieve().User;
        }
      
        public UploadDatabaseResult UploadDatabase(FileMessage request)
        {
            throw new NotImplementedException();
        }
    }
}
