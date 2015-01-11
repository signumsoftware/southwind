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
using System.IO.Compression;
using Signum.Engine.Basics;

namespace Southwind.Web
{
    //http://talentedmonkeys.wordpress.com/2010/11/29/wcf-400-bad-request-while-streaming-large-files-through-iis/
    public class ServerSouthwindTransfer : IServerSouthwindTransfer
    {
        protected T Return<T>(UserEntity user, MethodBase mi, string description, Func<T> function)
        {
            try
            {
                using (AuthLogic.UserSession(user))
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

        public Lite<DisconnectedExportEntity> BeginExportDatabase(Lite<UserEntity> user, Lite<DisconnectedMachineEntity> machine)
        {
            return Return(UnsafeRetrieve(user), MethodInfo.GetCurrentMethod(), null, () =>
                DisconnectedLogic.ExportManager.BeginExportDatabase(machine.Retrieve()));
        }

        public FileMessage EndExportDatabase(DownloadDatabaseRequests requests)
        {
            var stats = requests.DownloadStatistics;

            return Return(UnsafeRetrieve(requests.User), MethodInfo.GetCurrentMethod(), null, () =>
            {
                string fileName = DisconnectedLogic.ExportManager.BackupNetworkFileName(
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
            return Return(UnsafeRetrieve(request.User), MethodInfo.GetCurrentMethod(), null, () =>
            {
                var di = DisconnectedLogic.ImportManager.BeginImportDatabase(request.Machine.Retrieve(), request.Stream);

                return new UploadDatabaseResult { UploadStatistics = di }; 
            });
        }

        private static UserEntity UnsafeRetrieve(Lite<UserEntity> user)
        {
            using (AuthLogic.Disable())
                return user.RetrieveAndForget();
        }
    }
}
