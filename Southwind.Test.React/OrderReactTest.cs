using Signum.Authorization;
using Southwind.Customer;
using Southwind.Orders;
using Southwind.Products;

namespace Southwind.Test.React;

public class OrderReactTest : SouthwindTestClass
{
    public OrderReactTest()
    {
        SouthwindEnvironment.StartAndInitialize();
        AuthLogic.GloballyEnabled = false;
    }

    [Fact]
    public void OrderWebTestExample()
    {
        Browse("Standard", b =>
        {
            Lite<OrderEntity>? lite = null;
            try
            {
                b.SearchPage(typeof(PersonEntity)).Using(persons =>
                {
                    persons.Search();
                    persons.SearchControl.Results.OrderBy("Id");
                    return persons.Results.EntityClick<PersonEntity>(1);
                }).Using(john =>
                {
                    using (FrameModalProxy<OrderEntity> order = john.ConstructFrom(OrderOperation.CreateOrderFromCustomer))
                    {
                        order.ValueLineValue(a => a.ShipName, Guid.NewGuid().ToString());
                        order.EntityCombo(a => a.ShipVia).SelectLabel("FedEx");

                        ProductEntity sonicProduct = Database.Query<ProductEntity>().SingleEx(p => p.ProductName.Contains("Sonic"));

                        var line = order.EntityDetail(a => a.Details).GetOrCreateDetailControl<OrderDetailEmbedded>();
                        line.EntityLineValue(a => a.Product, sonicProduct.ToLite());

                        Assert.Equal(sonicProduct.UnitPrice, order.ValueLineValue(a => a.TotalPrice));

                        order.Execute(OrderOperation.Save);

                        lite = order.GetLite();

                        Assert.Equal(sonicProduct.UnitPrice, order.ValueLineValue(a => a.TotalPrice));
                    }

                    return b.NormalPage(lite);

                }).EndUsing(order =>
                {
                    Assert.Equal(lite!.InDB(a => a.TotalPrice), order.ValueLineValue(a => a.TotalPrice));
                });
            }
            finally
            {
                if (lite != null)
                    lite.Delete();
            }
        });
    }//OrderReactTestExample
}
