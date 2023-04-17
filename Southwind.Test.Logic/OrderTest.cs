using Signum.Authorization;
using Southwind.Customer;
using Southwind.Orders;
using Southwind.Products;

namespace Southwind.Test.Logic;

public class OrderTest
{
    public OrderTest()
    {
        SouthwindEnvironment.StartAndInitialize();
    }

    [Fact]
    public void OrderTestExample()
    {
        

        using (AuthLogic.UnsafeUserSession("Standard"))
        {
            using (Transaction tr = Transaction.Test()) // Transaction.Test avoids nested ForceNew transactions to be independent
            {
                var john = Database.Query<PersonEntity>().SingleEx(p => p.FirstName == "John");

                var order = john.ConstructFrom(OrderOperation.CreateOrderFromCustomer);

                var sonic = Database.Query<ProductEntity>().SingleEx(p=>p.ProductName.Contains("Sonic"));

                var line = order.AddLine(sonic);

                order.Execute(OrderOperation.Save);

                Assert.Equal(order.TotalPrice, sonic.UnitPrice);


                //tr.Commit();
            }
        }
    }//OrderTestExample
}
