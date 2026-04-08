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
            await b.SearchPageAsync(typeof(PersonEntity))
            .Then(async persons =>
            {
                await persons.SearchAsync();
                await persons.SearchControl.Results.OrderByAsync("Id");
                await persons.Results.EntityClickAsync<PersonEntity>(1).Then(async john =>
                {
                    await john.ConstructFromAsync(OrderOperation.CreateOrderFromCustomer, "create")
                    .Then(async order =>
                    {
                        await order.AutoLineValueAsync(a => a.ShipName, Guid.NewGuid().ToString());
                        await order.EntityCombo(a => a.ShipVia).SelectLabelAsync("FedEx");

                        ProductEntity sonicProduct = Database.Query<ProductEntity>().SingleEx(p => p.ProductName.Contains("Sonic"));

                        await order.EntityTable(a => a.Details).CreateRowAsync<OrderDetailEmbedded>().Then(async line =>
                        {
                            await line.EntityLineValueAsync(a => a.Product, sonicProduct.ToLite());
                        });

                        await order.WaitTotalPrice( sonicProduct.UnitPrice);

                        await order.ExecuteAsync(OrderOperation.Save);

                        await order.WaitTotalPrice(sonicProduct.UnitPrice);

                        lite = await order.GetLiteAsync();
                      
                    });
                });

                return await b.FramePageAsync(lite!);

            }).Then(async order =>
            {
                await order.WaitTotalPrice(lite!.InDB(a => a.TotalPrice));
            });

        });
    }//OrderReactTestExample


}

public static class OrderExtensions
{
    public static async Task WaitTotalPrice(this ILineContainer<OrderEntity> order, decimal unitPrice)
    {
        await order.Element.Locator("input.total-price").WaitAttributeAsync("value", unitPrice.ToString("00.00"));
    }
}
