using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Entities;
using Signum.Entities.DynamicQuery;
using Signum.Utilities;
using Signum.Windows.UIAutomation;
using Southwind.Entities;
using Southwind.Test.Environment;

namespace Southwind.Test.Windows
{
    [TestClass]
    public class OrderWindowTest
    {
        [ClassInitialize]
        public static void ClassInitialize(TestContext testContext)
        {
            SouthwindEnvironment.Start();
            AuthLogic.GloballyEnabled = false;
        }

        [TestMethod]
        public void OrderWindowsTestExample()
        {
            Lite<OrderEntity> lite = null;
            try
            {
                using (MainWindowProxy win = Common.OpenAndLogin("Normal", "Normal"))
                {
                    using (SearchWindowProxy persons = win.SelectQuery(typeof(PersonEntity)))
                    {
                        persons.Search();
                        persons.SearchControl.SortColumn("Id", OrderType.Ascending);

                        using (NormalWindowProxy<PersonEntity> john = persons.ViewElementAt<PersonEntity>(1))
                        {
                            using (NormalWindowProxy<OrderEntity> order = john.ConstructFrom(OrderOperation.CreateOrderFromCustomer))
                            {
                                order.ValueLineValue(a => a.ShipName, Guid.NewGuid().ToString());
                                order.EntityCombo(a => a.ShipVia).SelectToString("FedEx");

                                ProductEntity sonicProduct = Database.Query<ProductEntity>().SingleEx(p => p.ProductName.Contains("Sonic"));

                                order.DetailGrid().AddRow(sonicProduct.ToLite());

                                Assert.AreEqual(sonicProduct.UnitPrice, order.ValueLineValue(a => a.TotalPrice));

                                order.Execute(OrderOperation.SaveNew);

                                lite = order.Lite();

                                Assert.AreEqual(sonicProduct.UnitPrice, order.ValueLineValue(a => a.TotalPrice));
                            }
                        }
                    }

                    using (NormalWindowProxy<OrderEntity> order = win.SelectEntity(lite)) 
                    {
                        Assert.AreEqual(lite.InDB(a => a.TotalPrice), order.ValueLineValue(a => a.TotalPrice));
                    }
                }
            }
            finally
            {
                if(lite != null)
                    lite.Delete();
            }
        }//OrderWindowsTestExample
    }
}
