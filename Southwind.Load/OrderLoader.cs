﻿using System;
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
                    new ShipperDN
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

                var companies = Database.Query<CompanyDN>().Select(c => new 
                { 
                    Lite = c.ToLite<CustomerDN>(), 
                    c.ContactName 
                }).ToList();

                var persons = Database.Query<PersonDN>().Select(p => new 
                { 
                    Lite = p.ToLite<CustomerDN>(), 
                    ContactName = p.FirstName + " " + p.LastName 
                }).ToList();

                Dictionary<string, Lite<CustomerDN>> customerMapping = 
                    (from n in northwind
                     join s in companies.Concat(persons) on n.ContactName equals s.ContactName
                     select new KeyValuePair<string, Lite<CustomerDN>>(n.CustomerID, s.Lite)).ToDictionary();

                using (Transaction tr = new Transaction())
                using (Administrator.DisableIdentity<OrderDN>())
                using (OperationLogic.AllowSave<OrderDN>())
                {
                    IProgressInfo info;
                    foreach (Order o in db.Orders.ToProgressEnumerator(out info))
                    {
                        new OrderDN
                        {

                            Employee = Lite.Create<EmployeeDN>(o.EmployeeID.Value),
                            OrderDate = o.OrderDate.Value,
                            RequiredDate = o.RequiredDate.Value,
                            ShippedDate = o.ShippedDate,
                            State = o.ShippedDate.HasValue ? OrderState.Shipped : OrderState.Ordered,
                            ShipVia = Lite.Create<ShipperDN>(o.ShipVia.Value),
                            ShipName = o.ShipName,
                            ShipAddress = new AddressDN
                            {
                                Address = o.ShipAddress,
                                City = o.ShipCity,
                                Region = o.ShipRegion,
                                PostalCode = o.ShipPostalCode,
                                Country = o.ShipCountry,
                            },
                            Freight = o.Freight.Value,
                            Details = o.Order_Details.Select(od => new OrderDetailsDN
                            {
                                Discount = (decimal)od.Discount,
                                Product = Lite.Create<ProductDN>(od.ProductID),
                                Quantity = od.Quantity,
                                UnitPrice = od.UnitPrice,
                            }).ToMList(),
                            Customer = customerMapping[o.CustomerID].RetrieveAndForget(),
                            IsLegacy = true,
                        }.SetId(o.OrderID).Save();

                        SafeConsole.WriteSameLine(info.ToString());
                    }

                    tr.Commit();
                }
            }
        }

        public static void UpdateOrdersDate()
        {
            DateTime time = Database.Query<OrderDN>().Max(a => a.OrderDate);

            var now = TimeZoneManager.Now;
            var ts = (int)(now - time).TotalDays;

            ts = (ts / 7) * 7;

            Database.Query<OrderDN>().UnsafeUpdate()
                .Set(o => o.OrderDate, o => o.OrderDate.AddDays(ts))
                .Set(o => o.ShippedDate, o => o.ShippedDate.Value.AddDays(ts))
                .Set(o => o.RequiredDate, o => o.RequiredDate.AddDays(ts))
                .Set(o => o.CancelationDate, o => null)
                .Execute();


            var limit = TimeZoneManager.Now.AddDays(-10);

            var list = Database.Query<OrderDN>().Where(a => a.State == OrderState.Shipped && a.OrderDate < limit).Select(a => a.ToLite()).ToList();

            Random r = new Random(1);

            for (int i = 0; i < list.Count * 0.1f; i++)
            {
                r.NextElement(list).InDB().UnsafeUpdate()
                .Set(o => o.ShippedDate, o => null)
                .Set(o => o.CancelationDate, o => o.OrderDate.AddDays(o.Id % 10))
                .Set(o => o.State, o => OrderState.Canceled)
                .Execute();
            }
        }
    }
}
