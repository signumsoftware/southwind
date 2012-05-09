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

namespace Southwind.Windows
{
    public class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            try
            {
                Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-US");

                Server.SetNewServerCallback(NewServer);

                DisconnectedClient.GetTransferServer = NewServerTransfer;

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




        static ChannelFactory<IServerSouthwind> channelFactory;

        public static IBaseServer NewServer()
        {
            if (channelFactory == null)
                channelFactory = new ChannelFactory<IServerSouthwind>("server");

            IServerSouthwind result = channelFactory.CreateChannel();

            if (Application.Current == null || Application.Current.CheckAccess())
                return Login(result);
            else
                Application.Current.Dispatcher.Invoke(() =>
                {
                    result = Login(result);
                });

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



        static ChannelFactory<IServerSouthwindTransfer> channelFactoryServer;

        public static IServerSouthwindTransfer NewServerTransfer()
        {
            if (channelFactoryServer == null)
                channelFactoryServer = new ChannelFactory<IServerSouthwindTransfer>("serverTransfer");

            return channelFactoryServer.CreateChannel();
        }
    }
}
