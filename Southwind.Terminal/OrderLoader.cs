using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Kiota.Abstractions;
using NpgsqlTypes;
using Signum.DynamicQuery;
using Signum.Engine;
using Signum.Utilities.DataStructures;
using Signum.Utilities.Reflection;
using Southwind.Customers;
using Southwind.Employees;
using Southwind.Orders;
using Southwind.Products;
using Southwind.Shippers;
using NW = Southwind.Terminal.NorthwindSchema;

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

        var now = Clock.Today.AddDays(-1);
        var ts = max.DaysTo(now);

        foreach (var o in orders)
        {
            o.OrderDate = o.OrderDate.AddDays(ts);
            o.RequiredDate = o.RequiredDate.AddDays(ts);
            o.ShippedDate = o.ShippedDate?.AddDays(ts);
            if (o.State == OrderState.Shipped && (((int)o.Id) % 7 == 0))
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
                Database.Query<OrderEntity>().UnsafeUpdate()
                    .SetSystemPeriodMin(a => a.SystemPeriod(), a => a.OrderDate.ToDateTime().AddHours(8).AddMinutes((int)a.Id % (60 * 8)).AddSeconds((int)a.Id % 60))
                    .Execute("auto");

                Database.MListQuery((OrderEntity o) => o.Details)
                    .UnsafeUpdateMList()
                    .SetSystemPeriodMin(a => a.SystemPeriod(), a => a.Parent.SystemPeriod().Min)
                    .Execute("auto");
            }

            Database.Query<OrderEntity>().Where(a => a.State == OrderState.Shipped)
                .UnsafeUpdate(a => a.ShippedDate, a => a.ShippedDate!.Value.AddDays(1), "shipped");

            Database.Query<OrderEntity>().Where(a => a.State == OrderState.Canceled)
                .UnsafeUpdate(a => a.CancelationDate, a => a.CancelationDate!.Value.AddDays(1), "canceled");

            using (Administrator.DisableHistoryTable<OrderEntity>(includeMList: false))
            {
                Database.Query<OrderEntity>().Where(a => a.State == OrderState.Shipped).UnsafeUpdate().SetSystemPeriodMin(
                    a => a.SystemPeriod(),
                    a => a.ShippedDate!.Value.ToDateTime().AddHours(8).AddMinutes((int)a.Id % (60 * 8)).AddSeconds((int)a.Id % 60))
                    .Execute("shipped min");

                Database.Query<OrderEntity>().Where(a => a.State == OrderState.Canceled).UnsafeUpdate().SetSystemPeriodMin(
                    a => a.SystemPeriod(),
                    a => a.CancelationDate!.Value.ToDateTime().AddHours(8).AddMinutes((int)a.Id % (60 * 8)).AddSeconds((int)a.Id % 60))
                    .Execute("cancelled min");

                Database.Query<OrderEntity>().OverrideSystemTime(new SystemTime.HistoryTable())
                    .UnsafeUpdate()
                    .Set(a => a.State, a => OrderState.Ordered)
                    .Set(a => a.CancelationDate, a => null)
                    .Set(a => a.ShippedDate, a => null)
                    .SetSystemPeriodMax(a=>a.SystemPeriod(), ho => Database.Query<OrderEntity>().Single(mo => mo.Id == ho.Id).SystemPeriod().Min)
                    .Execute("Fix HT");
            }

            tr.Commit();
        }

    }

    static IUpdateable<T> SetSystemPeriodMin<T>(this IUpdateable<T> updateable, Expression<Func<T, NullableInterval<DateTime>>> systemPeriod, Expression<Func<T, DateTime?>> valueExpression)
    {
        if (Connector.Current is SqlServerConnector)
        {
            return updateable.Set(a => systemPeriod.Evaluate(a).Min, valueExpression);
        }
        else if (Connector.Current is PostgreSqlConnector)
        {
            return updateable.Set(systemPeriod, a => new NullableInterval<DateTime>(
                valueExpression.Evaluate(a)!.Value.ToUniversalTime(),
                systemPeriod.Evaluate(a).Max
                ));
        }
        else
            throw new NotSupportedException($"Connector {Connector.Current.GetType().Name} not supported for SystemPeriod updates");
    }

    static IUpdateable<T> SetSystemPeriodMax<T>(this IUpdateable<T> updateable, Expression<Func<T, NullableInterval<DateTime>>> systemPeriod, Expression<Func<T, DateTime?>> valueExpression)
    {
        if (Connector.Current is SqlServerConnector)
        {
            return updateable.Set(a => systemPeriod.Evaluate(a).Max, valueExpression);
        }
        else if (Connector.Current is PostgreSqlConnector)
        {
            return updateable.Set(systemPeriod, a => new NullableInterval<DateTime>(
                systemPeriod.Evaluate(a).Min,
                valueExpression.Evaluate(a)!.Value.ToUniversalTime()
                ));
        }
        else
            throw new NotSupportedException($"Connector {Connector.Current.GetType().Name} not supported for SystemPeriod updates");
    }
}
