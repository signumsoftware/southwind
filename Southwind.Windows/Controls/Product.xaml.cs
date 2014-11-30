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

namespace Southwind.Windows.Controls
{
    /// <summary>
    /// Interaction logic for Product.xaml
    /// </summary>
    public partial class Product : UserControl
    {
        public Product()
        {
            InitializeComponent();
            this.category.Remove = true;
            this.category.Create = Navigator.IsCreable(typeof(CategoryEntity), isSearch: true); 
        }

        private object EntityCombo_Creating()
        {
            return Navigator.View(new CategoryEntity
            {
                CategoryName = ((ProductEntity)this.DataContext).ProductName
            });
        }
    }
}
