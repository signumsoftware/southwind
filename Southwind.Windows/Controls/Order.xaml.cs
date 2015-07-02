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
using System.Collections;
using Signum.Services;
using Signum.Utilities;
using System.Data;
using System.Threading;

namespace Southwind.Windows.Controls
{
    /// <summary>
    /// Interaction logic for Order.xaml
    /// </summary>
    public partial class Order : UserControl
    {
        OrderDetailsEntity CurrentOrderDetails
        {
            get { return dgDetails.SelectedItem as OrderDetailsEntity; }
        }

        OrderEntity OrderEntity
        {
            get { return (OrderEntity)DataContext; }
        }

        public Order()
        {
            InitializeComponent();
        }

        private IEnumerable AutocompleteTextBox_AutoCompleting(string arg, CancellationToken ct)
        {
            return Server.Return((IBaseServer s) => s.FindLiteLike(Implementations.By(typeof(ProductEntity)), arg, 5)); 
        }    

        private void ebDetails_Finding(object sender, RoutedEventArgs e)
        {
            var product = Finder.Find<ProductEntity>();
            if (product == null)
                return;

            OrderDetailsEntity details = new OrderDetailsEntity
            {
                Product = product,
                Quantity = 1,
                UnitPrice = product.Retrieve().UnitPrice,
                Discount = 0,
            };

            OrderEntity.Details.Add(details); 
        }

        private void ebDetails_Removing(object sender, RoutedEventArgs e)
        {
            if (CurrentOrderDetails == null)
                return;

            OrderEntity.Details.Remove(CurrentOrderDetails);
        }

        private void dgDetails_SelectedCellsChanged(object sender, SelectedCellsChangedEventArgs e)
        {
            ebDetails.View = ebDetails.Remove = CurrentOrderDetails != null;
        }

        private void ebDetails_Viewing(object sender, RoutedEventArgs e)
        {
            if(CurrentOrderDetails == null)
                return;

            Navigator.Navigate(CurrentOrderDetails.Product);
        }

        private void AutocompleteTextBox_Closed(object sender, RoutedEventArgs e)
        {
            AutocompleteTextBox autoComplete = (AutocompleteTextBox)sender;
            OrderDetailsEntity orderDetails = (OrderDetailsEntity)autoComplete.DataContext;
            Lite<ProductEntity> product = (Lite<ProductEntity>)autoComplete.SelectedItem;

            orderDetails.Discount = 0;

            if (product == null)
            {
                orderDetails.UnitPrice = 0;
            }
            else
            {
                orderDetails.UnitPrice = product.Retrieve().UnitPrice;
            }

            dgDetails.CommitEdit(DataGridEditingUnit.Cell, true);
        }


        private void AutocompleteTextBox_Loaded(object sender, RoutedEventArgs e)
        {
            var actb = (AutocompleteTextBox)sender;
            actb.Text = CurrentOrderDetails.Product.TryToString();
            actb.Text = CurrentOrderDetails.Product.TryToString();
            actb.SelectAndFocus();
        }

        private void EntityLine_EntityChanged(object sender, bool userInteraction, object oldValue, object newValue)
        {
            if (userInteraction)
                this.OrderEntity.ShipAddress = ((CustomerEntity)newValue)?.Let(a => a.Address.Clone());
        }

        private object EntityLine_Finding()
        {
            return Finder.Find(new FindOptions(typeof(CustomerEntity))); 
        }
    }
}
