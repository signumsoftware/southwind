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
using Signum.Windows.Reports;
using Signum.Windows.Chart;
using Signum.Entities.Authorization;
using Signum.Windows.UserQueries;
using Signum.Windows.Disconnected;
using Southwind.Local;
using Southwind.Windows.Properties;
using System.IO;
using Signum.Windows.Omnibox;
using Signum.Windows.ControlPanels;
using Signum.Entities.Disconnected;
using Signum.Windows.Processes;
using Signum.Windows.Notes;
using Signum.Windows.Alerts;
using Signum.Windows.Profiler;

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

            this.DispatcherUnhandledException += (sender, args) => Program.HandleException("Unexpected error", args.Exception, App.Current.MainWindow); ;
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

            Navigator.Start(new NavigationManager(multithreaded:true));
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
                ctrl.Child<EntityLine>("Role").After(new ValueLine().Set(Common.RouteProperty, "[UserMixin].AllowLogin"));
                return ctrl;
            });

            LinksClient.Start(widget: true, contextualMenu: true);

            ProcessClient.Start(true, true);

            ReportClient.Start(true, false);
            UserQueryClient.Start();
            ChartClient.Start();
            ControlPanelClient.Start();

            ExceptionClient.Start();

            NoteClient.Start();
            AlertClient.Start(typeof(OrderDN));
            
            ProfilerClient.Start();

            OmniboxClient.Start();
            OmniboxClient.Register(new SpecialOmniboxProvider());
            OmniboxClient.Register(new EntityOmniboxProvider());
            OmniboxClient.Register(new DynamicQueryOmniboxProvider());
            OmniboxClient.Register(new UserQueryOmniboxProvider());
            OmniboxClient.Register(new UserChartOmniboxProvider());
            OmniboxClient.Register(new ChartOmniboxProvider());

            Navigator.AddSettings(new List<EntitySettings>
            {
                new EntitySettings<EmployeeDN>() { View = e => new Employee()},
                new EntitySettings<TerritoryDN>() { View = e => new Territory() },
                new EntitySettings<RegionDN>() { View = e => new Region() },

                new EntitySettings<ProductDN>() { View = e => new Product() },
                new EntitySettings<CategoryDN>() { View = e => new Category() },
                new EntitySettings<SupplierDN>() { View = e => new Supplier() },

                new EntitySettings<CompanyDN>() { View = e => new Company() },
                new EntitySettings<PersonDN>() { View = e => new Person() },

                new EntitySettings<OrderDN>() { View = e => new Order()},
            });

            Constructor.Register(elem => new OrderDN
            {
                OrderDate = DateTime.Now,
                RequiredDate = DateTime.Now.AddDays(2),
                Employee = ((EmployeeDN)UserDN.Current.Related).ToLite(),
                Details = new MList<OrderDetailsDN>()
            });

            Constructor.Register(elem => new PersonDN
            {
                Address = new AddressDN()
            });

            Constructor.Register(elem => new CompanyDN
            {
                Address = new AddressDN()
            });

            Func<Binding, DataTemplate> formatter = b =>
            {
                b.Converter = SouthwindConverters.ImageConverter;
                return Fluent.GetDataTemplate(() => new Image { MaxHeight = 32.0, Stretch = Stretch.Uniform }
                    .Bind(Image.SourceProperty, b)
                    .Set(RenderOptions.BitmapScalingModeProperty, BitmapScalingMode.Linear));
            };

            QuerySettings.RegisterPropertyFormat((EmployeeDN e) => e.Photo, formatter);
            QuerySettings.RegisterPropertyFormat((CategoryDN e) => e.Picture, formatter);

            DisconnectedClient.Start();

            Navigator.Initialize();

            if (DisconnectedClient.OfflineMode)
            {
                LocalServer.OverrideCommonEvents();
                DisconnectedExportRanges.Initialize(
                    LocalServer.LastExport(),    
                    DisconnectedMachineDN.Current.Retrieve(),
                    Server.ServerTypes.ToDictionary(k => k.Value.ToLite(), k => k.Key));
            }
        }
    }
}
