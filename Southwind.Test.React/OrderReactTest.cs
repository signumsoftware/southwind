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
    public async Task CreateOrderTest()
    {
        await BrowseAsync("Standard", async b =>
        {
            Lite<OrderEntity>? lite = null;
            var customer = Database.Query<PersonEntity>().OrderBy(p => p.Id).Skip(1).FirstEx().ToLite();
            await b.SearchPageAsync(typeof(PersonEntity)).Then(async persons =>
            {
                await persons.SearchAsync();
                return await persons.Results.EntityClickAsync(customer);
            }).Then(async john =>
            {
                await john.ConstructFromAsync(OrderOperation.CreateOrderFromCustomer).Then(async order =>
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
                });

                return await b.FramePageAsync(lite!);

            }).Then(async order =>
            {
                Assert.Equal(lite!.InDB(a => a.TotalPrice), await order.AutoLineValueAsync(a => a.TotalPrice));
            });
        });
    }//OrderReactTestExample
}
