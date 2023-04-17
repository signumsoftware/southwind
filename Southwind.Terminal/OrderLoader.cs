using Southwind.Customer;
using Southwind.Employees;
using Southwind.Globals;
using Southwind.Orders;
using Southwind.Products;
using Southwind.Shippers;
using Southwind.Terminal.NorthwindSchema;

namespace Southwind.Terminal;

internal static class OrderLoader
{
    public static void LoadShippers()
    {
        var shippers = Connector.Override(Northwind.Connector).Using(_ => Database.View<Southwind.Terminal.NorthwindSchema.Shippers>().ToList());

        shippers.Select(s => new ShipperEntity
        {
            CompanyName = s.CompanyName,
            Phone = s.Phone,
        }.SetId(s.ShipperID))
        .BulkInsert(disableIdentity: true);
    }

    public static void LoadOrders()
    {
        Dictionary<string, CustomerEntity> customers = new Dictionary<string, CustomerEntity>();
        customers.AddRange(Database.Query<CompanyEntity>().Select(c => KeyValuePair.Create(c.ContactName, (CustomerEntity)c)));
        customers.AddRange(Database.Query<PersonEntity>().Select(p => KeyValuePair.Create(p.FirstName + " " + p.LastName, (CustomerEntity)p)));

        var orders = Connector.Override(Northwind.Connector).Using(_ => Database.View<Southwind.Terminal.NorthwindSchema.Orders>().Select(o => new OrderEntity
        {
            Employee = Lite.Create<EmployeeEntity>(o.EmployeeID!.Value),
            OrderDate = o.OrderDate!.Value,
            RequiredDate = o.RequiredDate!.Value,
            ShippedDate = o.ShippedDate,
            State = o.ShippedDate.HasValue ? OrderState.Shipped : OrderState.Ordered,
            ShipVia = Lite.Create<ShipperEntity>(o.ShipVia!.Value),
            ShipName = o.ShipName,
            ShipAddress = new AddressEmbedded
            {
                Address = o.ShipAddress,
                City = o.ShipCity,
                Region = o.ShipRegion,
                PostalCode = o.ShipPostalCode,
                Country = o.ShipCountry,
            },
            Freight = o.Freight!.Value,
            Details = Database.View<OrderDetails>().Where(od => od.OrderID == o.OrderID).Select(od => new OrderDetailEmbedded
            {
                Discount = (decimal)od.Discount,
                Product = Lite.Create<ProductEntity>(od.ProductID),
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
            }).ToMList(),
            Customer = customers.GetOrThrow(Database.View<Customers>().Where(c => c.CustomerID == o.CustomerID).Select(a => a.ContactName).SingleOrDefaultEx()!),
            IsLegacy = true,
        }.SetId(o.OrderID)).ToList());

        orders.BulkInsert(disableIdentity: true, validateFirst: true, message: "auto");
    }

    public static void UpdateOrdersDate()
    {
        DateTime time = Database.Query<OrderEntity>().Max(a => a.OrderDate);

        var now = Clock.Now;
        var ts = (int)(now - time).TotalDays;

        ts = (ts / 7) * 7;

        Database.Query<OrderEntity>().UnsafeUpdate()
            .Set(o => o.OrderDate, o => o.OrderDate.AddDays(ts))
            .Set(o => o.ShippedDate, o => o.ShippedDate!.Value.AddDays(ts))
            .Set(o => o.RequiredDate, o => o.RequiredDate.AddDays(ts))
            .Set(o => o.CancelationDate, o => null)
            .Execute();


        var limit = Clock.Now.AddDays(-10);

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
