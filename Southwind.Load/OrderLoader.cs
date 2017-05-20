using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine;
using Southwind.Entities;
using Signum.Utilities;
using Signum.Entities;
using Signum.Services;
using System.Globalization;
using Signum.Engine.Operations;

namespace Southwind.Load
{
    internal static class OrderLoader
    {
        public static void LoadShippers()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                Administrator.SaveListDisableIdentity(db.Shippers.Select(s =>
                    new ShipperEntity
                    {
                        CompanyName = s.CompanyName,
                        Phone = s.Phone,
                    }.SetId(s.ShipperID)));
            }
        }

        public static void LoadOrders()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                var northwind = db.Customers.Select(a => new { a.CustomerID, a.ContactName }).ToList();

                var companies = Database.Query<CompanyEntity>().Select(c => new
                {
                    Entity = (CustomerEntity)c,
                    c.ContactName
                }).ToList();

                var persons = Database.Query<PersonEntity>().Select(p => new
                {
                    Entity = (CustomerEntity)p,
                    ContactName = p.FirstName + " " + p.LastName
                }).ToList();

                Dictionary<string, CustomerEntity> customerMapping =
                    (from n in northwind
                     join s in companies.Concat(persons) on n.ContactName equals s.ContactName
                     select KVP.Create(n.CustomerID, s.Entity)).ToDictionary();

                var orders = db.Orders.ToList().Select(o => new OrderEntity
                {
                    Employee = Lite.Create<EmployeeEntity>(o.EmployeeID.Value),
                    OrderDate = o.OrderDate.Value,
                    RequiredDate = o.RequiredDate.Value,
                    ShippedDate = o.ShippedDate,
                    State = o.ShippedDate.HasValue ? OrderState.Shipped : OrderState.Ordered,
                    ShipVia = Lite.Create<ShipperEntity>(o.ShipVia.Value),
                    ShipName = o.ShipName,
                    ShipAddress = new AddressEmbedded
                    {
                        Address = o.ShipAddress,
                        City = o.ShipCity,
                        Region = o.ShipRegion,
                        PostalCode = o.ShipPostalCode,
                        Country = o.ShipCountry,
                    },
                    Freight = o.Freight.Value,
                    Details = o.Order_Details.Select(od => new OrderDetailEmbedded
                    {
                        Discount = (decimal)od.Discount,
                        Product = Lite.Create<ProductEntity>(od.ProductID),
                        Quantity = od.Quantity,
                        UnitPrice = od.UnitPrice,
                    }).ToMList(),
                    Customer = customerMapping.GetOrThrow(o.CustomerID),
                    IsLegacy = true,
                }.SetId(o.OrderID));

                orders.BulkInsert(disableIdentity: true, validateFirst: true, message: "auto");

            }
        }

        public static void UpdateOrdersDate()
        {
            DateTime time = Database.Query<OrderEntity>().Max(a => a.OrderDate);

            var now = TimeZoneManager.Now;
            var ts = (int)(now - time).TotalDays;

            ts = (ts / 7) * 7;

            Database.Query<OrderEntity>().UnsafeUpdate()
                .Set(o => o.OrderDate, o => o.OrderDate.AddDays(ts))
                .Set(o => o.ShippedDate, o => o.ShippedDate.Value.AddDays(ts))
                .Set(o => o.RequiredDate, o => o.RequiredDate.AddDays(ts))
                .Set(o => o.CancelationDate, o => null)
                .Execute();


            var limit = TimeZoneManager.Now.AddDays(-10);

            var list = Database.Query<OrderEntity>().Where(a => a.State == OrderState.Shipped && a.OrderDate < limit).Select(a => a.ToLite()).ToList();

            Random r = new Random(1);

            for (int i = 0; i < list.Count * 0.1f; i++)
            {
                r.NextElement(list).InDB().UnsafeUpdate()
                .Set(o => o.ShippedDate, o => null)
                .Set(o => o.CancelationDate, o => o.OrderDate.AddDays((int)o.Id % 10))
                .Set(o => o.State, o => OrderState.Canceled)
                .Execute();
            }
        }
    }
}
