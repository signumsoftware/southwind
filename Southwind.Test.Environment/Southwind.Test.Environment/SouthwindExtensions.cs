using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Signum.Engine;
using Signum.Entities;
using Signum.Utilities;
using Southwind.Entities;

namespace Southwind.Test.Environment
{
    public static class SouthwindExtensions
    {
        public static OrderDetailsDN AddLine(this OrderDN order, string productName, int quantity = 1, decimal discount = 0)
        {   
            var product = Database.Query<ProductDN>().SingleEx(p => p.ProductName.Contains(productName));

            return AddLine(order, product, quantity, discount);  
        }

        public static OrderDetailsDN AddLine(this OrderDN order, ProductDN product, int quantity = 1, decimal discount = 0)
        {
            var result = new OrderDetailsDN
            {
                Product = product.ToLite(),
                UnitPrice = product.UnitPrice,
                Quantity = quantity,
                Discount = discount,
            };

            order.Details.Add(result);

            return result;
        }
    }
}
