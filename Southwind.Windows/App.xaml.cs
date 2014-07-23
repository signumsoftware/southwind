using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Markup;
using System.Windows.Threading;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Services;
using Signum.Windows;
using Signum.Windows.Basics;
using Southwind.Entities;
using Southwind.Windows.Controls;
using System.Windows.Media;
using System.Windows.Data;
using Signum.Windows.Operations;
using Signum.Windows.Authorization;
using Signum.Windows.Excel;
using Signum.Windows.Chart;
using Signum.Entities.Authorization;
using Signum.Windows.UserQueries;
using Signum.Windows.Disconnected;
using Southwind.Local;
using Southwind.Windows.Properties;
using System.IO;
using Signum.Windows.Omnibox;
using Signum.Windows.Dashboard;
using Signum.Entities.Disconnected;
using Signum.Windows.Processes;
using Signum.Windows.Notes;
using Signum.Windows.Alerts;
using Signum.Windows.Profiler;
using Southwind.Windows.Code;
using Signum.Windows.Scheduler;
using Signum.Windows.SMS;

namespace Southwind.Windows
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        public App()
        {
            FrameworkElement.LanguageProperty.OverrideMetadata(typeof(FrameworkElement),
                new FrameworkPropertyMetadata(XmlLanguage.GetLanguage(CultureInfo.InvariantCulture.IetfLanguageTag)));

            this.DispatcherUnhandledException += (sender, args) => { Program.HandleException("Unexpected error", args.Exception, App.Current.MainWindow); args.Handled = true; };
            Async.DispatcherUnhandledException += (e, w) => Program.HandleException("Error in async call", e, w);
            Async.AsyncUnhandledException += (e, w) => Program.HandleException("Error in async call", e, w);

            InitializeComponent();
        }

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            //Fix so App.xaml InitializeComponent gets generated
        }

        protected override void OnStartup(StartupEventArgs args)
        {
        }

        static bool started = false;
        public static void Start()
        {
            if (started)
                return;

            started = true;

            Navigator.Start(new NavigationManager(multithreaded: true));
            Constructor.Start(new ConstructorManager());

            OperationClient.Start(new OperationManager());

            AuthClient.Start(
                types: true,
                property: true,
                queries: true,
                permissions: true,
                operations: true,
                defaultPasswordExpiresLogic: false);

            Navigator.EntitySettings<UserDN>().OverrideView((usr, ctrl) =>
            {
                using (Common.DelayRoutes())
                {
                    ctrl.Child<EntityLine>("Role").After(new ValueLine().Set(Common.RouteProperty, "[UserMixin].AllowLogin"));
                }
                return ctrl;
            });

            LinksClient.Start(widget: true, contextualMenu: true);

            ProcessClient.Start(package: true, packageOperation: true);
            SchedulerClient.Start();

            ExcelClient.Start(toExcel: true, excelReport: false);
            UserQueryClient.Start();
            ChartClient.Start();
            DashboardClient.Start();

            ExceptionClient.Start();

            NoteClient.Start(typeof(OrderDN));
            AlertClient.Start(typeof(OrderDN));
            SMSClient.Start();
            
            ProfilerClient.Start();

            OmniboxClient.Start();
            OmniboxClient.Register(new SpecialOmniboxProvider());
            OmniboxClient.Register(new EntityOmniboxProvider());
            OmniboxClient.Register(new DynamicQueryOmniboxProvider());
            OmniboxClient.Register(new UserQueryOmniboxProvider());
            OmniboxClient.Register(new ChartOmniboxProvider());
            OmniboxClient.Register(new UserChartOmniboxProvider());
            OmniboxClient.Register(new DashboardOmniboxProvider());

            SouthwindClient.Start();

            DisconnectedClient.Start();

            Navigator.Initialize();

            if (Server.OfflineMode)
            {
                DisconnectedExportRanges.Initialize(
                    LocalServer.LastExport(),    
                    DisconnectedMachineDN.Current.Retrieve(),
                    Server.ServerTypes.ToDictionary(k => k.Value.ToLite(), k => k.Key));
            }//OfflineMode 
        }
    }
}
