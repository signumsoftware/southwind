﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Engine;
using Signum.Engine.DynamicQuery;
using Southwind.Entities;
using System.Reflection;
using Signum.Utilities;
using Signum.Engine.Operations;
using Signum.Entities.Authorization;
using Signum.Engine.Processes;
using Signum.Engine.Scheduler;
using Signum.Entities.Processes;

namespace Southwind.Logic
{
    public static class OrderLogic
    {
        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<OrderDN>();

                dqm.RegisterQuery(typeof(OrderDN), () =>
                    from o in Database.Query<OrderDN>()
                    select new
                    {
                        Entity = o.ToLite(),
                        o.Id,
                        o.State,
                        o.Customer,
                        o.Employee,
                        o.OrderDate,
                        o.RequiredDate,
                        o.ShipAddress,
                        o.ShipVia,
                    });

                dqm.RegisterQuery(OrderQuery.OrderLines, () =>
                    from o in Database.Query<OrderDN>()
                    from od in o.Details
                    select new
                    {
                        Entity = o.ToLite(),
                        o.Id,
                        od.Product,
                        od.Quantity,
                        od.UnitPrice,
                        od.Discount,
                        od.SubTotalPrice,
                    });

                OrderGraph.Register();

                ProcessLogic.Register(OrderProcess.CancelOrders, new CancelOrderAlgorithm());

                SimpleTaskLogic.Register(OrderTasks.CancelOldOrdersWithProcess, () =>
                {
                    var package = new PackageDN().CreateLines(Database.Query<OrderDN>().Where(a => a.OrderDate < DateTime.Now.AddDays(-7)));

                    var process = ProcessLogic.Create(OrderProcess.CancelOrders, package);
                        
                    process.Execute(ProcessOperation.Execute);
                    
                    return process.ToLite();
                });
 
                SimpleTaskLogic.Register(OrderTasks.CancelOldOrders, () =>
                {
                    Database.Query<OrderDN>()
                        .Where(a => a.OrderDate < DateTime.Now.AddDays(-7))
                        .UnsafeUpdate()
                        .Set(o => o.CancelationDate, o => DateTime.Now)
                        .Set(o => o.State, o => OrderState.Canceled)
                        .Execute();

                    return null;
                });//CancelOldOrdersProcess 
            }
        }

        public class CancelOrderAlgorithm : PackageExecuteAlgorithm<OrderDN>
        {
            public CancelOrderAlgorithm() : base(OrderOperation.Cancel) { }

            public override void Execute(ExecutingProcess executingProcess)
            {
                base.Execute(executingProcess); // Override if necessary
            }
        } //CancelOrderAlgorithm

        public class OrderGraph : Graph<OrderDN, OrderState>
        {
            public static void Register()
            {
                GetState = o => o.State;

                new Construct(OrderOperation.Create)
                {
                    ToState = OrderState.New,
                    Construct = (_) => new OrderDN
                    {
                        State = OrderState.New,
                        Employee = EmployeeDN.Current.ToLite(),
                        RequiredDate = DateTime.Now.AddDays(3),
                        ShipAddress = new AddressDN(),
                    }
                }.Register();

                new ConstructFrom<CustomerDN>(OrderOperation.CreateOrderFromCustomer)
                {
                    ToState = OrderState.New,  
                    Construct = (c, _) => new OrderDN
                    {
                        State = OrderState.New,
                        Customer = c,
                        Employee = EmployeeDN.Current.ToLite(),
                        ShipAddress = c.Address,
                        RequiredDate = DateTime.Now.AddDays(3),
                    }
                }.Register();

                new ConstructFromMany<ProductDN>(OrderOperation.CreateOrderFromProducts)
                {
                    ToState = OrderState.New,
                    Construct = (prods, args) =>
                    {
                        var dic = Database.Query<ProductDN>()
                            .Where(p => prods.Contains(p.ToLite()))
                            .Select(p => new KeyValuePair<Lite<ProductDN>, decimal>(p.ToLite(), p.UnitPrice)).ToDictionary();

                        var customer = args.TryGetArgC<Lite<CustomerDN>>().Try(c => c.Retrieve());

                        return new OrderDN
                        {
                            Customer = customer,
                            ShipAddress = customer.Try(c => c.Address.Clone()),
                            State = OrderState.New,
                            Employee = EmployeeDN.Current.ToLite(),
                            RequiredDate = DateTime.Now.AddDays(3),
                            Details = prods.Select(p => new OrderDetailsDN
                            {
                                Product = p,
                                UnitPrice = dic[p],
                                Quantity = 1,
                            }).ToMList()
                        };
                    }
                }.Register();

                new Graph<ProcessDN>.ConstructFromMany<OrderDN>(OrderOperation.CancelWithProcess)
                {
                    Construct = (orders, _) =>
                    {
                        return ProcessLogic.Create(OrderProcess.CancelOrders, new PackageDN().CreateLines(orders));
                    }
                }.Register();

                new Execute(OrderOperation.SaveNew)
                {
                    FromStates = { OrderState.New },
                    ToState = OrderState.Ordered,
                    AllowsNew = true,
                    Lite = false,
                    Execute = (o, args) =>
                    {
                        o.OrderDate = DateTime.Now;
                        o.State = OrderState.Ordered;
                    }
                }.Register();

                new Execute(OrderOperation.Save)
                {
                    FromStates = { OrderState.Ordered },
                    ToState = OrderState.Ordered,
                    Lite = false,
                    Execute = (o, _) =>
                    {
                    }
                }.Register();

                new Execute(OrderOperation.Ship)
                {
                    CanExecute = o => o.Details.IsEmpty() ? "No order lines" : null,
                    FromStates = { OrderState.Ordered },
                    ToState = OrderState.Shipped,
                    Execute = (o, args) =>
                    {
                        o.ShippedDate = args.TryGetArgS<DateTime>() ?? DateTime.Now;
                        o.State = OrderState.Shipped;
                    }
                }.Register();

                new Execute(OrderOperation.Cancel)
                {
                    FromStates = { OrderState.Ordered, OrderState.Shipped },
                    ToState = OrderState.Canceled,
                    Execute = (o, args) =>
                    {
                        o.CancelationDate = DateTime.Now;
                        o.State = OrderState.Canceled;
                    }
                }.Register();

                new Delete(OrderOperation.Delete)
                {
                    FromStates = { OrderState.Ordered},
                    Delete = (o, args) =>
                    {
                        o.Delete();
                    }
                }.Register();
            }
        }

        public static OrderDN Create(OrderDN order)
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
                        throw new ApplicationException("There are not enought {0} in stock".Formato(od.Product));
                }

                order.Save();

                return tr.Commit(order);
            }
        }
    }
}
