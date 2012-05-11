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
using System.IO.Compression;

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

        public Lite<DownloadStatisticsDN> BeginExportDatabase(Lite<UserDN> user, Lite<DisconnectedMachineDN> machine)
        {
            return Return(UnsafeRetrieve(user), MethodInfo.GetCurrentMethod(), null, () =>
                DisconnectedLogic.ExportManager.BeginExportDatabase(machine.Retrieve()));
        }

        public FileMessage EndExportDatabase(DownloadDatabaseRequests requests)
        {
            var stats = requests.DownloadStatistics;

            return Return(UnsafeRetrieve(requests.User), MethodInfo.GetCurrentMethod(), null, () =>
            {
                string fileName = DisconnectedLogic.ExportManager.BackupFileName(
                    requests.DownloadStatistics.Retrieve().Machine.Retrieve(), 
                    requests.DownloadStatistics);
                
                var fi = new FileInfo(fileName);

                return new FileMessage
                {
                    FileName = fi.Name,
                    Length = fi.Length,
                    Stream = fi.OpenRead(), //,
                    OnDisposing = () => File.Delete(fileName),
                };
            });
        }

        public UploadDatabaseResult UploadDatabase(UploadDatabaseRequest request)
        {
            throw new NotImplementedException();
        }

        private static UserDN UnsafeRetrieve(Lite<UserDN> user)
        {
            using (AuthLogic.Disable())
                return user.RetrieveAndForget();
        }
    }
}
