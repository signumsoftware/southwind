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

            if (DisconnectedClient.OfflineMode)
            {
                miDisconnected.Header = ((string)miDisconnected.Header) + " (Offline)";
                miDownload.IsEnabled = false;
            }
            else
            {
                miDisconnected.Header = ((string)miDisconnected.Header) + " (Online)";
            }
        }

        private void MenuItem_Click(object sender, RoutedEventArgs e)
        {
            DisconnectedClient.DownloadDatabase(this);
        }
    }
}
