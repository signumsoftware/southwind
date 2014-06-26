using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Signum.Windows;
using Signum.Utilities;
using Southwind.Windows.Controls;
using Southwind.Entities;
using Signum.Windows.Disconnected;

namespace Southwind.Windows
{
    /// <summary>
    /// Interaction logic for Main.xaml
    /// </summary>
    public partial class Main : Window
    {
        public Main()
        {
            InitializeComponent();
            this.Loaded += new RoutedEventHandler(Main_Loaded);
        }

        void Main_Loaded(object sender, RoutedEventArgs e)
        {
            MenuManager.ProcessMenu(menu);

            if (Server.OfflineMode)
            {
                miDisconnected.Header = "(Local)";
                miDownload.IsEnabled = false;
            }
            else
            {
                miDisconnected.Header = "(Server)";
                miUpload.IsEnabled = false;
            }
        }

        private void miDownload_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("Downloading a database will take a while and close your session. Are you sure?", "Confirm database download", MessageBoxButton.YesNo) == MessageBoxResult.Yes)
            {
                new DownloadProgress().ShowDialog();
            }
        }

        private void miUpload_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("You need to restart the application and choose Upload and Sync. Close now?", "Close application", MessageBoxButton.YesNo) == MessageBoxResult.Yes)
            {
                Application.Current.Shutdown();
            }
        }
    }
}
