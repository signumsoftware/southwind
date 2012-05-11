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

namespace Southwind.Windows
{
    /// <summary>
    /// Interaction logic for RestoringDatabase.xaml
    /// </summary>
    public partial class RestoringDatabase : Window
    {
        public RestoringDatabase()
        {
            InitializeComponent();
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (!Completed)
            {
                MessageBox.Show("Operation can not be cancelled");

                e.Cancel = true;
            }
        }

        public bool Completed { get; set; }
    }
}
