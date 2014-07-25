using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Engine.Operations;
using Signum.Utilities;
using Southwind.Entities;
using Southwind.Test.Environment;

namespace Southwind.Test.Logic
{
    [TestClass]
    public class OrderTest
    {
        [ClassInitialize]
        public static void ClassInitialize(TestContext testContext)
        {
            SouthwindEnvironment.StartAndInitialize();
        }

        [TestMethod]
        public void OrderTestExample()
        {
            using (AuthLogic.UnsafeUserSession("Normal"))
            {
                using (Transaction tr = Transaction.Test()) // Transaction.Test avoids nested ForceNew transactions to be independent
                {
                    var john = Database.Query<PersonDN>().SingleEx(p => p.FirstName == "John");

                    var order = john.ConstructFrom(OrderOperation.CreateOrderFromCustomer);

                    var sonic = Database.Query<ProductDN>().SingleEx(p=>p.ProductName.Contains("Sonic"));

                    var line = order.AddLine(sonic);

                    order.Execute(OrderOperation.SaveNew);

                    Assert.AreEqual(order.TotalPrice, sonic.UnitPrice);
 

                    //tr.Commit();
                }
            }
        }
    }
}
