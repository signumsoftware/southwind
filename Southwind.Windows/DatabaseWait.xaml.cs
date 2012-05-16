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
using Signum.Utilities;
using System.Threading.Tasks;
using Signum.Windows;

namespace Southwind.Windows
{
    /// <summary>
    /// Interaction logic for RestoringDatabase.xaml
    /// </summary>
    public partial class DatabaseWait : Window
    {
        public static readonly DependencyProperty MessageProperty =
          DependencyProperty.Register("Message", typeof(string), typeof(DatabaseWait), new UIPropertyMetadata(""));
        public string Message
        {
            get { return (string)GetValue(MessageProperty); }
            set { SetValue(MessageProperty, value); }
        }

        public DatabaseWait()
        {
            InitializeComponent();
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (!Completed)
            {
                e.Cancel = true;
            }
        }

        public bool Completed { get; set; }

        public static void Waiting(string title, string message, Action action)
        {
            DatabaseWait rd = new DatabaseWait
            {
                Title = title,
                Message = message,
            };

            var t =  Task.Factory.StartNew(action).ContinueWith(_ =>
            {
                rd.Dispatcher.BeginInvoke(() =>
                {
                    rd.Completed = true;
                    rd.Close();
                }); 
            });

            rd.ShowDialog();
        }
    }
}
