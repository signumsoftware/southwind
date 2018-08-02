using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Southwind.Logic;
using Signum.Utilities;
using Southwind.Services;
using Signum.Engine.Disconnected;
using Signum.Engine;
using Signum.Entities.Disconnected;
using Signum.Entities.DynamicQuery;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Maps;
using Signum.Entities;
using System.Data.SqlClient;
using Signum.Engine.Authorization;
using Signum.Engine.Cache;
using System.Threading;
using System.ServiceModel;

namespace Southwind.Local
{
    public static class LocalServer
    {
        static Thread hostThread;

        static ManualResetEvent stopEvent;
        static ManualResetEvent startedEvent;

        public static void Start(string connectionString)
        {
            Starter.Start(UserConnections.Replace(connectionString));

            DisconnectedLogic.OfflineMode = true;

            Schema.Current.Initialize();

            stopEvent = new ManualResetEvent(false);
            startedEvent = new ManualResetEvent(false);

            //http://www.johnplummer.com/dotnet/simple-wcf-service-host.html
            hostThread = new Thread(() =>
            {
                using (ServiceHost host = new ServiceHost(typeof(ServerSouthwindLocal)))
                {
                    host.Open();

                    startedEvent.Set();

                    stopEvent.WaitOne();

                    host.Close();
                }
            });

            hostThread.Start();
            startedEvent.WaitOne();
        }

        static ChannelFactory<IServerSouthwind> channelFactory;
        public static IServerSouthwind GetLocalServer()
        {
            if (channelFactory == null)
                channelFactory = new ChannelFactory<IServerSouthwind>("local");

            IServerSouthwind result = channelFactory.CreateChannel();
            return result;
        }

        public static IServerSouthwindTransfer GetLocalServerTransfer()
        {
            return new ServerSouthwindTransferLocal();
        }

        public static void RestoreDatabase(string connectionString, string backupFile, string databaseFile, string databaseLogFile)
        {
            DisconnectedLogic.LocalBackupManager.RestoreLocalDatabase(
                UserConnections.Replace(connectionString),
                backupFile,
                databaseFile,
                databaseLogFile);
        }

        public static void BackupDatabase(string connectionString, string backupFile)
        {
            SqlConnectionStringBuilder csb = new SqlConnectionStringBuilder(UserConnections.Replace(connectionString));
            string databaseName = csb.InitialCatalog;
            csb.InitialCatalog = "";

            using (Connector.Override(new SqlConnector(csb.ToString(), null, SqlServerVersion.SqlServer2012)))
            {
                DisconnectedLogic.LocalBackupManager.BackupDatabase(new DatabaseName(null, databaseName), backupFile);
            }
        }

        public static void DropDatabase(string connectionString)
        {
            SqlConnectionStringBuilder csb = new SqlConnectionStringBuilder(UserConnections.Replace(connectionString));
            string databaseName = csb.InitialCatalog;
            csb.InitialCatalog = "";

            using (Connector.Override(new SqlConnector(csb.ToString(), null, SqlServerVersion.SqlServer2012)))
            {
                DisconnectedLogic.LocalBackupManager.DropDatabase(new DatabaseName(null, databaseName));
            }
        }


        public static void Stop()
        {
            stopEvent.Set();
            hostThread.Join();
        }
    }
}
