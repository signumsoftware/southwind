using Signum.Processes;
using Signum.Scheduler;
using Southwind.Customers;
using Southwind.Employees;
using Southwind.Products;

namespace Southwind.Orders;

public static class OrdersLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.AlreadyDefined(MethodInfo.GetCurrentMethod()))
            return;

        sb.Include<OrderEntity>()
            .WithQuery(() => o => new
            {
                Entity = o,
                o.Id,
                o.State,
                o.Customer,
                o.Employee,
                o.OrderDate,
                o.RequiredDate,
                o.ShipAddress,
                o.ShipVia,
            });

        QueryLogic.Queries.Register(OrderQuery.OrderLines, () =>
            from o in Database.Query<OrderEntity>()
            from od in o.Details
            select new
            {
                Entity = o,
                o.Id,
                od.Product,
                od.Quantity,
                od.UnitPrice,
                od.Discount,
                od.SubTotalPrice,
            });

        OrderGraph.Register();

        ProcessLogic.Register(OrderProcess.CancelOrders, new CancelOrderAlgorithm());

        SimpleTaskLogic.Register(OrderTask.CancelOldOrdersWithProcess, ctx =>
        {
            var package = new PackageEntity().CreateLines(Database.Query<OrderEntity>().Where(a => a.OrderDate < Clock.Today.AddDays(-7) && a.State != OrderState.Canceled));

            var process = ProcessLogic.Create(OrderProcess.CancelOrders, package);

            process.Execute(ProcessOperation.Execute);

            return process.ToLite();
        });

        SimpleTaskLogic.Register(OrderTask.CancelOldOrders, ctx =>
        {
            Database.Query<OrderEntity>()
                .Where(a => a.OrderDate < Clock.Today.AddDays(-7))
                .UnsafeUpdate()
                .Set(o => o.CancelationDate, o => Clock.Today)
                .Set(o => o.State, o => OrderState.Canceled)
                .Execute();

            return null;
        });//CancelOldOrdersProcess
    }

    public class CancelOrderAlgorithm : PackageExecuteAlgorithm<OrderEntity>
    {
        public CancelOrderAlgorithm() : base(OrderOperation.Cancel) { }

        public override void Execute(ExecutingProcess executingProcess)
        {
            base.Execute(executingProcess); // Override if necessary
        }
    } //CancelOrderAlgorithm

    public class OrderGraph : Graph<OrderEntity, OrderState>
    {
        public static void Register()
        {
            GetState = o => o.State;

            new Construct(OrderOperation.Create)
            {
                ToStates = { OrderState.New },
                Construct = (args) =>
                {
                    var customer = args.TryGetArgC<Lite<CustomerEntity>>()?.Retrieve();

                    return new OrderEntity
                    {
                        Customer = customer!,
                        ShipAddress = customer?.Address.Clone()!,
                        State = OrderState.New,
                        Employee = EmployeeEntity.Current!,
                        RequiredDate = Clock.Today.AddDays(3),
                    };
                }
            }.Register();

            new ConstructFrom<CustomerEntity>(OrderOperation.CreateOrderFromCustomer)
            {
                ToStates = { OrderState.New },
                Construct = (c, _) => new OrderEntity
                {
                    State = OrderState.New,
                    Customer = c,
                    Employee = EmployeeEntity.Current!,
                    ShipAddress = c.Address,
                    RequiredDate = Clock.Today.AddDays(3),
                }
            }.Register();

            new ConstructFrom<OrderEntity>(OrderOperation.Clone)
            {
                CanConstructExpression = o => o.State.InState(OrderState.Shipped),
                ToStates = { OrderState.Ordered },
                ResultIsSaved = true,
                Construct = (o, _) =>
                {

                    var currentPrices = o.InDB()
                        .SelectMany(a => a.Details)
                        .Select(a => a.Product)
                        .Distinct()
                        .Select(p => KeyValuePair.Create(p, p.Entity.UnitPrice))
                        .ToDictionaryEx();

                    return new OrderEntity
                    {
                        State = OrderState.Ordered,
                        Customer = o.Customer,
                        Employee = EmployeeEntity.Current!,
                        ShipAddress = o.ShipAddress.Clone(),
                        RequiredDate = Clock.Today.AddDays(3),
                        OrderDate = Clock.Today,
                        Details = o.Details.Select(c => new OrderDetailEmbedded
                        {
                            Product = c.Product,
                            Discount = 0,
                            Quantity = c.Quantity,
                            UnitPrice = currentPrices.GetOrThrow(c.Product),
                        }).ToMList()
                    }.Save();
                }
            }.Register();

            new ConstructFromMany<ProductEntity>(OrderOperation.CreateOrderFromProducts)
            {
                ToStates = { OrderState.New },
                Construct = (prods, args) =>
                {
                    var dic = Database.Query<ProductEntity>()
                        .Where(p => prods.Contains(p.ToLite()))
                        .Select(p => new KeyValuePair<Lite<ProductEntity>, decimal>(p.ToLite(), p.UnitPrice)).ToDictionary();

                    var customer = args.TryGetArgC<Lite<CustomerEntity>>()?.Retrieve();

                    return new OrderEntity
                    {
                        Customer = customer!,
                        ShipAddress = customer?.Address.Clone()!,
                        State = OrderState.New,
                        Employee = EmployeeEntity.Current!,
                        RequiredDate = Clock.Today.AddDays(3),
                        Details = prods.Select(p => new OrderDetailEmbedded
                        {
                            Product = p,
                            UnitPrice = dic[p],
                            Quantity = 1,
                        }).ToMList()
                    };
                }
            }.Register();

            new Graph<ProcessEntity>.ConstructFromMany<OrderEntity>(OrderOperation.CancelWithProcess)
            {
                Construct = (orders, _) =>
                {
                    return ProcessLogic.Create(OrderProcess.CancelOrders, new PackageEntity().CreateLines(orders));
                }
            }.Register();

            new Execute(OrderOperation.Save)
            {
                FromStates = { OrderState.New, OrderState.Ordered },
                ToStates = { OrderState.Ordered },
                CanBeNew = true,
                CanBeModified = true,
                Execute = (o, args) =>
                {
                    if (o.IsNew)
                    {
                        o.OrderDate = Clock.Today;
                    }
                    o.State = OrderState.Ordered;
                }
            }.Register();

            new Execute(OrderOperation.Ship)
            {
                CanExecuteExpression = o => o.Details.IsEmpty() ? ValidationMessage._0IsEmpty.NiceToString(Entity.NicePropertyName(() => o.Details)) : null,
                FromStates = { OrderState.Ordered },
                ToStates = { OrderState.Shipped },
                CanBeModified = true,
                Execute = (o, args) =>
                {
                    o.ShippedDate = args.TryGetArgS<DateOnly>() ?? Clock.Today;
                    o.State = OrderState.Shipped;
                }
            }.Register();

            new Execute(OrderOperation.Cancel)
            {
                FromStates = { OrderState.Ordered, OrderState.Shipped },
                ToStates = { OrderState.Canceled },
                Execute = (o, args) =>
                {
                    o.CancelationDate = Clock.Today;
                    o.State = OrderState.Canceled;
                }
            }.Register();

            new Delete(OrderOperation.Delete)
            {
                FromStates = { OrderState.Ordered },
                Delete = (o, args) =>
                {
                    o.Delete();
                }
            }.Register();
        }
    }

    public static OrderEntity Create(OrderEntity order)
    {
        if (!order.IsNew)
            throw new ArgumentException("order should be new");

        using (Transaction tr = new Transaction())
        {
            foreach (var od in order.Details)
            {
                int updated = od.Product.InDB()
                    .Where(p => p.UnitsInStock >= od.Quantity)
                    .UnsafeUpdate()
                    .Set(p => p.UnitsInStock, p => (short)(p.UnitsInStock - od.Quantity))
                    .Execute();

                if (updated != 1)
                    throw new ApplicationException("There are not enought {0} in stock".FormatWith(od.Product));
            }

            order.Save();

            return tr.Commit(order);
        }
    }
}
