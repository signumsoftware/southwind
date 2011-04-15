using System;
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

namespace Southwind.Logic
{
    public static class OrderLogic
    {
        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<OrderDN>();

                dqm[typeof(OrderDN)] = (from o in Database.Query<OrderDN>()
                                        select new
                                        {
                                            Entity = o.ToLite(),
                                            o.Id,
                                            Customer = o.Customer.ToLite(),
                                            o.Employee,
                                            o.OrderDate,
                                            o.RequiredDate,
                                            o.ShipAddress, 
                                            o.ShipVia,
                                        }).ToDynamic();

                dqm[OrderQueries.OrderLines] = (from o in Database.Query<OrderDN>()
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
                                                }).ToDynamic();

                new GraphOrder().Register();

            }
        }

        class GraphOrder : Graph<OrderDN, OrderState>
        {
            public GraphOrder()
            {
                this.GetState = o => o.State;
                this.Operations = new List<IGraphOperation>()
                {
                    new Goto(OrderOperations.Create, OrderState.Ordered)
                    {
                        FromStates = new []{ OrderState.New },
                        AllowsNew = true,
                        Lite = false,
                        Execute = (e,args)=>
                        {
                            e.OrderDate = DateTime.Now;
                            e.State = OrderState.Ordered;
                        }
                    },

                    new Goto(OrderOperations.Save, OrderState.Ordered)
                    {
                        FromStates = new []{ OrderState.Ordered },
                        Lite = false,
                        Execute = (e,args)=>
                        {
                        }
                    },

                    new Goto(OrderOperations.Ship, OrderState.Shipped)
                    {
                        FromStates = new []{ OrderState.Ordered },
                        Execute = (e,args)=>
                        {
                            e.ShippedDate = DateTime.Now;
                            e.State = OrderState.Shipped;
                        }
                    },

                    new Goto(OrderOperations.Cancel, OrderState.Canceled)
                    {
                        FromStates = new []{ OrderState.Ordered, OrderState.Shipped },
                        Execute = (e,args)=>
                        {
                            e.CancelationDate = DateTime.Now;
                            e.State = OrderState.Canceled;
                        }
                    },
                }; 
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
                    int updated = od.Product.InDB().Where(p => p.UnitsInStock >= od.Quantity).UnsafeUpdate<ProductDN>(p => new ProductDN
                    {
                        UnitsInStock = (short)(p.UnitsInStock - od.Quantity)
                    });


                    if (updated != 1)
                        throw new ApplicationException("There are not enought {0} in stock".Formato(od.Product)); 
                }

                order.Save(); 

                return tr.Commit(order); 
            }
        }
    }
}
