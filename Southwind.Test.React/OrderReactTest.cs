using Signum.Authorization;
using Southwind.Customers;
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
    public async Task OrderWebTestExampleAsync()
    {
        await BrowseAsync("Standard", async b =>
        {
            Lite<OrderEntity>? lite = null;
            await b.SearchPageAsync(typeof(PersonEntity)).Await_UsingAsync(async persons =>
            {
                await persons.SearchAsync();
                await persons.SearchControl.Results.OrderByAsync("Id");
                return await persons.Results.EntityClickAsync<PersonEntity>(1);
            }).Await_UsingAsync(async john =>
            {
                using (FrameModalProxy<OrderEntity> order = await john.ConstructFromAsync(OrderOperation.CreateOrderFromCustomer))
                {
                    await order.AutoLineValueAsync(a => a.ShipName, Guid.NewGuid().ToString());
                    await order.EntityCombo(a => a.ShipVia).SelectLabelAsync("FedEx");

                    ProductEntity sonicProduct = Database.Query<ProductEntity>().SingleEx(p => p.ProductName.Contains("Sonic"));

                    var line = await order.EntityDetail(a => a.Details).GetOrCreateDetailControlAsync<OrderDetailEmbedded>();
                    await line.EntityLineValueAsync(a => a.Product, sonicProduct.ToLite());

                    Assert.Equal(sonicProduct.UnitPrice, await order.AutoLineValueAsync(a => a.TotalPrice));

                    await order.ExecuteAsync(OrderOperation.Save);

                    lite = await order.GetLiteAsync();

                    Assert.Equal(sonicProduct.UnitPrice, await order.AutoLineValueAsync(a => a.TotalPrice));
                }

                return await b.FramePageAsync(lite);

            }).Await_EndUsingAsync(async order =>
            {
                Assert.Equal(lite!.InDB(a => a.TotalPrice), await order.AutoLineValueAsync(a => a.TotalPrice));
            });

        });
    }//OrderReactTestExample
}
