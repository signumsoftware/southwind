
using Southwind.Orders;
using Southwind.Products;

namespace Southwind.Test.Environment;

public static class SouthwindExtensions
{
    public static OrderDetailEmbedded AddLine(this OrderEntity order, string productName, int quantity = 1, decimal discount = 0)
    {
        var product = Database.Query<ProductEntity>().SingleEx(p => p.ProductName.Contains(productName));

        return AddLine(order, product, quantity, discount);
    }

    public static OrderDetailEmbedded AddLine(this OrderEntity order, ProductEntity product, int quantity = 1, decimal discount = 0)
    {
        var result = new OrderDetailEmbedded
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
