using NW = Southwind.Terminal.NorthwindSchema;
using Southwind.Orders;
using Southwind.Customers;
using Southwind.Shippers;
using Southwind.Employees;
using Southwind.Products;
using Microsoft.Kiota.Abstractions;
using Signum.DynamicQuery;

namespace Southwind.Terminal;

internal static class OrderLoader
{
    public static void LoadShippers()
    {
        var shippers = Connector.Override(NW.Northwind.Connector).Using(_ => Database.View<NW.Shippers>().ToList());

        shippers.Select(s => new ShipperEntity
        {
            CompanyName = s.CompanyName,
            Phone = s.Phone!,
        }.SetId(s.ShipperID))
        .BulkInsert(disableIdentity: true);
    }

    public static void LoadOrders()
    {
        Dictionary<string, CustomerEntity> customers = new Dictionary<string, CustomerEntity>();
        customers.AddRange(Database.Query<CompanyEntity>().Select(c => KeyValuePair.Create(c.ContactName, (CustomerEntity)c)));
        customers.AddRange(Database.Query<PersonEntity>().Select(p => KeyValuePair.Create(p.FirstName + " " + p.LastName, (CustomerEntity)p)));

        var orders = Connector.Override(NW.Northwind.Connector).Using(_ => Database.View<NW.Orders>().Select(o => new OrderEntity
        {
            Employee = Lite.Create<EmployeeEntity>(o.EmployeeID!.Value),
            OrderDate = o.OrderDate!.Value.ToDateOnly(),
            RequiredDate = o.RequiredDate!.Value.ToDateOnly(),
            ShippedDate = o.ShippedDate.ToDateOnly(),
            State = o.ShippedDate.HasValue ? OrderState.Shipped : OrderState.Ordered,
            ShipVia = Lite.Create<ShipperEntity>(o.ShipVia!.Value),
            ShipName = o.ShipName,
            ShipAddress = new AddressEmbedded
            {
                Address = o.ShipAddress!,
                City = o.ShipCity!,
                Region = o.ShipRegion,
                PostalCode = o.ShipPostalCode,
                Country = o.ShipCountry!,
            },
            Freight = o.Freight!.Value,
            Details = Database.View<NW.OrderDetails>().Where(od => od.OrderID == o.OrderID).Select(od => new OrderDetailEmbedded
            {
                Discount = (decimal)od.Discount,
                Product = Lite.Create<ProductEntity>(od.ProductID),
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
            }).ToMList(),
            Customer = customers.GetOrThrow(Database.View<NW.Customers>().Where(c => c.CustomerID == o.CustomerID).Select(a => a.ContactName).SingleOrDefaultEx()!),
            IsLegacy = true,
        }.SetId(o.OrderID)).ToList());

        var max = orders.Max(a => a.OrderDate);

        var now = Clock.Today;
        var ts = max.DaysTo(now);

        foreach (var o in orders)
        {
            o.OrderDate = o.OrderDate.AddDays(ts);
            o.RequiredDate = o.RequiredDate.AddDays(ts);
            o.ShippedDate = o.ShippedDate?.AddDays(ts);
            if(o.State == OrderState.Shipped && (((int)o.Id) % 7 == 0))
            {
                o.CancelationDate = o.ShippedDate;
                o.State = OrderState.Canceled;
                o.ShippedDate = null;
            }
        }

        orders.BulkInsert(disableIdentity: true, validateFirst: false, message: "auto");
    }

    public static void SimulateOrderSystemTime()
    {
        using (var tr = new Transaction())
        {
            using (Administrator.DisableHistoryTable<OrderEntity>())
            {
                Database.Query<OrderEntity>().UnsafeUpdate(
                    a => a.SystemPeriod().Min,
                    a => a.OrderDate.ToDateTime().AddHours(8).AddMinutes((int)a.Id % (60 * 8)).AddSeconds((int)a.Id % 60), "auto");

                Database.MListQuery((OrderEntity o) => o.Details)
                    .UnsafeUpdateMList(a => a.SystemPeriod().Min,
                    a => a.Parent.SystemPeriod().Min, "auto");
            }

            Database.Query<OrderEntity>().Where(a => a.State == OrderState.Shipped)
                .UnsafeUpdate(a => a.ShippedDate, a => a.ShippedDate!.Value.AddDays(1), "shipped");

            Database.Query<OrderEntity>().Where(a => a.State == OrderState.Canceled)
                .UnsafeUpdate(a => a.CancelationDate, a => a.CancelationDate!.Value.AddDays(1), "canceled");

            using (Administrator.DisableHistoryTable<OrderEntity>(includeMList: false))
            {
                Database.Query<OrderEntity>().Where(a => a.State == OrderState.Shipped).UnsafeUpdate(
                    a => a.SystemPeriod().Min,
                    a => a.ShippedDate!.Value.ToDateTime().AddHours(8).AddMinutes((int)a.Id % (60 * 8)).AddSeconds((int)a.Id % 60), "shipped min");

                Database.Query<OrderEntity>().Where(a => a.State == OrderState.Canceled).UnsafeUpdate(
                    a => a.SystemPeriod().Min,
                    a => a.CancelationDate!.Value.ToDateTime().AddHours(8).AddMinutes((int)a.Id % (60 * 8)).AddSeconds((int)a.Id % 60), "cancelled min");

                Database.Query<OrderEntity>().OverrideSystemTime(new SystemTime.HistoryTable())
                    .UnsafeUpdate()
                    .Set(a => a.State, a => OrderState.Ordered)
                    .Set(a => a.CancelationDate, a => null)
                    .Set(a => a.ShippedDate, a => null)
                    .Set(a => a.SystemPeriod().Max, ho => Database.Query<OrderEntity>().Single(mo => mo.Id == ho.Id).SystemPeriod().Min)
                    .Execute("Fix HT");
            }

            tr.Commit();
        }

    }
}
