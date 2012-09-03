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
using Signum.Entities.Exceptions;
using Signum.Entities;

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
                
                if (File.Exists(DisconnectedClient.DatabaseFile) || File.Exists(DisconnectedClient.DownloadBackupFile))
                {
                    StartOption result;
                    if (!SelectorWindow.ShowDialog(
                        EnumExtensions.GetValues<StartOption>(), out result,
                        elementIcon: so => SouthwindImageLoader.GetImageSortName(so == StartOption.RunLocally ? "local.png" : "server.png"),
                        elementText: so => so.NiceToString(),
                        title: "Startup mode",
                        message: "A local database has been found on your system.\r\nWhat you want to do?"))
                        return;

                    if (result == StartOption.RunLocally)
                    {
                        if (File.Exists(DisconnectedClient.DownloadBackupFile))
                        {
                            DatabaseWait.Waiting("Waiting", "Restoring database...", ()=>
                            {
                                LocalServer.RestoreDatabase(
                                    Settings.Default.LocalDatabaseConnectionString,
                                    DisconnectedClient.DownloadBackupFile,
                                    DisconnectedClient.DatabaseFile,
                                    DisconnectedClient.DatabaseLogFile);

                                File.Delete(DisconnectedClient.DownloadBackupFile);
                            });
                        }

                        LocalServer.Start(Settings.Default.LocalDatabaseConnectionString);
                        DisconnectedClient.OfflineMode = true;

                        Program.GetServer = LocalServer.GetServer;
                        DisconnectedClient.GetTransferServer = LocalServer.GetServerTransfer;
                    }
                    else
                    {

                        Program.GetServer = RemoteServer;
                        DisconnectedClient.GetTransferServer = RemoteServerTransfer;
                    }
                }
                else
                {
                    Program.GetServer = RemoteServer; 
                    DisconnectedClient.GetTransferServer = RemoteServerTransfer;
                }

                Server.SetNewServerCallback(NewServerAndLogin);
                Server.Connect();

                App.Start();

                if (!DisconnectedClient.OfflineMode)
                {
                    if (File.Exists(DisconnectedClient.DownloadBackupFile))
                        File.Delete(DisconnectedClient.DownloadBackupFile);
                    else
                    {
                        if (File.Exists(DisconnectedClient.DatabaseFile))
                        {
                            DatabaseWait.Waiting("Waiting", "Backing up...", () =>
                            {
                                LocalServer.BackupDatabase(
                                    Settings.Default.LocalDatabaseConnectionString,
                                    DisconnectedClient.UploadBackupFile);
                            });
                        }

                        if (File.Exists(DisconnectedClient.UploadBackupFile))
                        {
                            if (new UploadProgress().ShowDialog() == false)
                                return;

                            LocalServer.DropDatabase(Settings.Default.LocalDatabaseConnectionString);
                            File.Delete(DisconnectedClient.UploadBackupFile);
                        }
                    }
                }
                

                App app = new App() { ShutdownMode = ShutdownMode.OnMainWindowClose };
                app.Run(new Main());
            }
            catch (Exception e)
            {
                HandleException("Start-up error", e);
            }

            try
            {
                Server.ExecuteNoRetryOnSessionExpired((ILoginServer ls) => ls.Logout());
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
                try
                {
                    var exception = new ExceptionDN(e.FollowC(ex => ex.InnerException).Last())
                    {
                        User = UserDN.Current.ToLite(),
                        ControllerName = "WindowsClient",
                        ActionName = "WindowClient",
                        Version = typeof(Program).Assembly.GetName().Version.ToString(),
                        UserHostName = Environment.MachineName,
                    };

                    Server.ExecuteNoRetryOnSessionExpired((IBaseServer s) => s.Save(exception));
                }
                catch { }
                finally
                {
                    var bla = e.FollowC(ex => ex.InnerException);
                    MessageBox.Show(
                        bla.ToString(ex => "{0} : {1}".Formato(
                            ex.GetType().Name != "FaultException" ? ex.GetType().Name : "Server Error",
                            ex.Message), "\r\n\r\n"),
                        errorTitle + ":",
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
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
