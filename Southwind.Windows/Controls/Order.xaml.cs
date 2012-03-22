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

namespace Southwind.Windows.Controls
{
    /// <summary>
    /// Interaction logic for Order.xaml
    /// </summary>
    public partial class Order : UserControl
    {
        OrderDetailsDN CurrentOrderDetails
        {
            get { return dgDetails.SelectedItem as OrderDetailsDN; }
        }

        OrderDN OrderEntity
        {
            get { return (OrderDN)DataContext; }
        }

        public Order()
        {
            InitializeComponent();
        }

        private IEnumerable AutoCompleteTextBox_AutoCompleting(string arg)
        {
            return Server.Return((IBaseServer s) => s.FindLiteLike(typeof(ProductDN), null, arg, 5)); 
        }    

        private void ebDetails_Finding(object sender, RoutedEventArgs e)
        {
            var product = Navigator.Find<ProductDN>();
            if (product == null)
                return;

            OrderDetailsDN details = new OrderDetailsDN
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

        private void AutoCompleteTextBox_Closed(object sender, RoutedEventArgs e)
        {
            AutoCompleteTextBox autoComplete = (AutoCompleteTextBox)sender;
            OrderDetailsDN orderDetails = (OrderDetailsDN)autoComplete.DataContext;
            Lite<ProductDN> product = (Lite<ProductDN>)autoComplete.SelectedItem;

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


        private void AutoCompleteTextBox_Loaded(object sender, RoutedEventArgs e)
        {
            var actb = (AutoCompleteTextBox)sender;
            actb.Text = CurrentOrderDetails.Product.TryToString();
            actb.Text = CurrentOrderDetails.Product.TryToString();
            actb.SelectAndFocus();
        }

        private void EntityLine_EntityChanged(object sender, bool userInteraction, object oldValue, object newValue)
        {
            if (userInteraction)
                this.OrderEntity.ShipAddress = ((CustomerDN)newValue).TryCC(a => a.Address.Clone());
        }

        private object EntityLine_Finding()
        {
            return Navigator.Find(new FindOptions(typeof(CustomerDN))); 
        }
    }
}
