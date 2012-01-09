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
using System.Windows.Navigation;
using System.Windows.Shapes;
using Signum.Windows;
using Signum.Entities;
using Southwind.Entities;
using Microsoft.Win32;
using System.IO;

namespace Southwind.Windows.Controls
{
    /// <summary>
    /// Interaction logic for Category.xaml
    /// </summary>
    public partial class Category : UserControl
    {
        public Category()
        {
            InitializeComponent();
        }

        private void image_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ClickCount != 2)
                return;

            OpenFileDialog ofd = new OpenFileDialog()
            {
                Filter = "Bitmap Image | *.bmp| Jpeg Image  |*.jpg,*.jpeg| Png Image |*.png"
            };
            if (ofd.ShowDialog(this.FindCurrentWindow()) != true)
                return;

            ((CategoryDN)DataContext).Picture = File.ReadAllBytes(ofd.FileName);
        }
    }
}
