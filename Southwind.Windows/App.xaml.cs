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
using Signum.Windows.Logging;
using Southwind.Local;
using Southwind.Windows.Properties;
using System.IO;
using Signum.Windows.Omnibox;

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

            this.DispatcherUnhandledException += new DispatcherUnhandledExceptionEventHandler(App_DispatcherUnhandledException);
            Async.ExceptionHandler = UnhandledAsyncException;

            InitializeComponent();
        }

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            //Fix so App.xaml InitializeComponent gets generated
        }

        void UnhandledAsyncException(Exception e)
        {
            Program.HandleException("Error in async call", e);
        }

        void App_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
        {
            Program.HandleException("Unexpected error", e.Exception);
            e.Handled = true;
        }

        protected override void OnStartup(StartupEventArgs args)
        {
            Start();
        }

        static bool started = false;
        public static void Start()
        {
            if (started)
                return;

            started = true;

            Navigator.Start(new NavigationManager());
            Constructor.Start(new ConstructorManager());

            OperationClient.Start(new OperationManager());
            AuthClient.Start(
                types: true,
                property: true,
                queries: true,
                permissions: true,
                operations: true,
                facadeMethods: true,
                defaultPasswordExpiresLogic: false);

            LinksWidget.Start();

            ReportClient.Start(true, false);
            UserQueryClient.Start();
            ChartClient.Start(() => new ChartRendererVisifire());

            DisconnectedClient.Start();
            ExceptionClient.Start();

            OmniboxClient.Start(entities: true, dynamicQueries: true);

            Navigator.AddSettings(new List<EntitySettings>
            {
                new EntitySettings<EmployeeDN>(EntityType.Default) { View = e => new Employee(), IsCreable= admin=>false},
                new EntitySettings<TerritoryDN>(EntityType.Admin) { View = e => new Territory() },
                new EntitySettings<RegionDN>(EntityType.Admin) { View = e => new Region() },

                new EntitySettings<ProductDN>(EntityType.Admin) { View = e => new Product() },
                new EntitySettings<CategoryDN>(EntityType.Admin) { View = e => new Category() },
                new EntitySettings<SupplierDN>(EntityType.Admin) { View = e => new Supplier() },

                new EntitySettings<CompanyDN>(EntityType.Default) { View = e => new Company() },
                new EntitySettings<PersonDN>(EntityType.Default) { View = e => new Person() },

                new EntitySettings<OrderDN>(EntityType.DefaultNotSaving) { View = e => new Order()},
            });

            Constructor.ConstructorManager.Constructors.Add(typeof(OrderDN), win => new OrderDN
            {
                OrderDate = DateTime.Now,
                RequiredDate = DateTime.Now.AddDays(2),
                Employee = ((EmployeeDN)UserDN.Current.Related).ToLite(),
                Details = new MList<OrderDetailsDN>()
            });

            Constructor.Register(win => new PersonDN
            {
                Address = new AddressDN()
            });
            Constructor.Register(win => new CompanyDN
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

            Navigator.Initialize();

            if (DisconnectedClient.OfflineMode)
            {
                LocalServer.OverrideCommonEvents();
            }
        }
    }
}
