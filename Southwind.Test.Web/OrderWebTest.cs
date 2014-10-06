using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Entities;
using Signum.Utilities;
using Signum.Web.Selenium;
using Southwind.Entities;
using Southwind.Test.Environment;

namespace Southwind.Test.Web
{
    [TestClass]
    public class OrderWebTest : Common
    {
        [ClassInitialize]
        public static void ClassInitialize(TestContext testContext)
        {
            Common.Start(testContext);
            SouthwindEnvironment.Start();
            AuthLogic.GloballyEnabled = false;
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            Common.MyTestCleanup();
        }

        [TestMethod]
        public void OrderWebTestExample()
        {
            Login("Normal", "Normal");
            Lite<OrderDN> lite = null;
            try
            {
                this.SearchPage(typeof(PersonDN)).Using(persons =>
                {
                    persons.Search();
                    persons.SearchControl.Results.OrderBy("Id");
                    return persons.Results.EntityClick<PersonDN>(1);
                }).Using(john =>
                {
                    using (PopupControl<OrderDN> order = john.ConstructFromPopup(OrderOperation.CreateOrderFromCustomer))
                    {
                        order.ValueLineValue(a => a.ShipName, Guid.NewGuid().ToString());
                        order.EntityCombo(a => a.ShipVia).SelectLabel("FedEx");

                        ProductDN sonicProduct = Database.Query<ProductDN>().SingleEx(p => p.ProductName.Contains("Sonic"));

                        var line = order.EntityListDetail(a => a.Details).CreateElement<OrderDetailsDN>();
                        line.EntityLineValue(a => a.Product, sonicProduct.ToLite());

                        Assert.AreEqual(sonicProduct.UnitPrice, order.ValueLineValue(a => a.TotalPrice));

                        order.ExecuteAjax(OrderOperation.SaveNew);

                        lite = order.GetLite();

                        Assert.AreEqual(sonicProduct.UnitPrice, order.ValueLineValue(a => a.TotalPrice));
                    }

                    return this.NormalPage(lite);

                }).EndUsing(order =>
                {
                    Assert.AreEqual(lite.InDB(a => a.TotalPrice), order.ValueLineValue(a => a.TotalPrice));
                });
            }
            finally
            {
                if (lite != null)
                    lite.Delete();
            }
        }//OrderWebTestExample
    }
}
