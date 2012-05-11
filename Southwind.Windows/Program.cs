using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ServiceModel;
using System.Windows;
using System.ServiceModel.Security;
using System.Threading;
using System.Globalization;
using Signum.Utilities;
using Signum.Windows;
using Signum.Services;
using Southwind.Services;
using Signum.Entities.Authorization;
using Signum.Windows.Authorization;
using Southwind.Windows.Properties;
using Signum.Windows.Disconnected;
using System.IO;
using Southwind.Local;
using Signum.Entities.Disconnected;

namespace Southwind.Windows
{
    public class Program
    {
        public enum StartOption
        {
            RunLocally,
            UploadAndSync
        }

        [STAThread]
        public static void Main(string[] args)
        {
            try
            {
                Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-US");

                
                if (File.Exists(DisconnectedClient.DatabaseFile) || File.Exists(DisconnectedClient.BackupFile))
                {
                    StartOption result;
                    if (!SelectorWindow.ShowDialog(
                        EnumExtensions.GetValues<StartOption>(), out result,
                        elementIcon: so => SouthwindImageLoader.GetImageSortName(so == StartOption.RunLocally ? "local.png" : "server.png"),
                        elementText: so => so.NiceToString(),
                        title: "Startup mode",
                        message: "A local database has been found on your system.\r\nWhat you want to do?"))
                        return;

                    if (File.Exists(DisconnectedClient.BackupFile))
                    {
                        RestoringDatabase rd = new RestoringDatabase();

                        rd.Show();

                        LocalServer.RestoreDatabase(
                            Settings.Default.LocalDatabaseConnectionString,
                            DisconnectedClient.BackupFile,
                            DisconnectedClient.DatabaseFile,
                            DisconnectedClient.DatabaseLogFile);

                        rd.Completed = true;
                        rd.Close();

                        File.Delete(DisconnectedClient.BackupFile);
                    }

                    if (result == StartOption.RunLocally)
                    {
                        LocalServer.Start(Settings.Default.LocalDatabaseConnectionString);
                        DisconnectedClient.OfflineMode = true;


                        Program.GetServer = LocalServer.GetServer;
                        DisconnectedClient.GetTransferServer = LocalServer.GetServerTransfer;
                    }
                }
                else
                {

                    Program.GetServer = RemoteServer; 
                    DisconnectedClient.GetTransferServer = RemoteServerTransfer;
                }

                Server.SetNewServerCallback(NewServerAndLogin);
                Server.Connect();

                App app = new App() { ShutdownMode = ShutdownMode.OnMainWindowClose };
                app.Run(new Main());
            }
            catch (Exception e)
            {
                HandleException("Start-up error", e);
            }

            try
            {
                Server.Execute((ILoginServer ls) => ls.Logout());
            }
            catch
            { }
        }

        public static void HandleException(string errorTitle, Exception e)
        {
            if (e is MessageSecurityException)
            {
                MessageBox.Show("Session expired", "Session Expired", MessageBoxButton.OK, MessageBoxImage.Hand);

            }
            else
            {
                var bla = e.FollowC(ex => ex.InnerException);

                MessageBox.Show(
                    bla.ToString(ex => "{0} : {1}".Formato(ex.GetType().Name, ex.Message), "\r\n\r\n"),
                    errorTitle + ":",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }



        static Func<IServerSouthwind> GetServer;

        public static IBaseServer NewServerAndLogin()
        {
            IServerSouthwind result = GetServer();

            if (Application.Current == null || Application.Current.CheckAccess())
                return Login(result);
            else
                Application.Current.Dispatcher.Invoke(() =>
                {
                    result = Login(result);
                });

            return result;
        }


        static ChannelFactory<IServerSouthwind> channelFactory;
        private static IServerSouthwind RemoteServer()
        {
            if (channelFactory == null)
                channelFactory = new ChannelFactory<IServerSouthwind>("server");

            IServerSouthwind result = channelFactory.CreateChannel();
            return result;
        }

        static IServerSouthwind Login(IServerSouthwind result)
        {
            Login milogin = new Login
            {
                Title = "Welcome to Southwind",
                UserName = Settings.Default.UserName,
                Password = "",
                ProductName = "Southwind",
                CompanyName = "Signum Software"
            };

            milogin.LoginClicked += (object sender, EventArgs e) =>
            {
                try
                {
                    result.Login(milogin.UserName, Security.EncodePassword(milogin.Password));

                    Settings.Default.UserName = milogin.UserName;
                    Settings.Default.Save();

                    UserDN.Current=result.GetCurrentUser();

                    // verificar el tiempo de expiracion
                    var alerta = result.PasswordNearExpired();
                    if (alerta.HasText())
                        MessageBox.Show(alerta);


                    milogin.DialogResult = true;
                }

                catch (FaultException ex)
                {
                    milogin.Error = ex.Message;

                    if (ex.Code.Name == typeof(IncorrectUsernameException).Name)
                    {
                        milogin.FocusUserName();
                    }
                    else if (ex.Code.Name == typeof(IncorrectPasswordException).Name)
                    {
                        milogin.FocusPassword();
                    }
                }
            };

            milogin.FocusUserName();

            bool? dialogResult = milogin.ShowDialog();
            if (dialogResult == true)
            {
                UserDN user = result.GetCurrentUser();
                UserDN.Current=user;

                return result;
            }
            else
            {
                return null;
            }
        }



        static ChannelFactory<IServerSouthwindTransfer> channelFactoryRemote;
        public static IServerSouthwindTransfer RemoteServerTransfer()
        {
            if (channelFactoryRemote == null)
                channelFactoryRemote = new ChannelFactory<IServerSouthwindTransfer>("serverTransfer");

            return channelFactoryRemote.CreateChannel();
        }
    }
}
