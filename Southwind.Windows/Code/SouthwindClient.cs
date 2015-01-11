using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Entities.Reflection;
using Signum.Utilities;
using Signum.Utilities.Reflection;
using Signum.Windows;
using Signum.Windows.Operations;
using Southwind.Entities;
using Southwind.Windows.Controls;

namespace Southwind.Windows.Code
{
    public static class SouthwindClient
    {
        public static void Start()
        {
            if (Navigator.Manager.NotDefined(MethodInfo.GetCurrentMethod()))
            {

                Navigator.AddSettings(new List<EntitySettings>
                {
                    new EntitySettings<EmployeeEntity>() { View = e => new Employee()},
                    new EntitySettings<TerritoryEntity>() { View = e => new Territory() },
                    new EntitySettings<RegionEntity>() { View = e => new Region() },

                    new EntitySettings<ProductEntity>() { View = e => new Product() },
                    new EntitySettings<CategoryEntity>() { View = e => new Category(), IsViewable = true },
                    new EntitySettings<SupplierEntity>() { View = e => new Supplier() },

                    new EntitySettings<CompanyEntity>() { View = e => new Company() },
                    new EntitySettings<PersonEntity>() { View = e => new Person() },

                    new EntitySettings<OrderEntity>() { View = e => new Order()},
                });

         
                QuerySettings.RegisterPropertyFormat((EmployeeEntity e) => e.Photo, b =>
                {
                    b.Converter = SouthwindConverters.ImageConverter;
                    return Fluent.GetDataTemplate(() => new Image { MaxHeight = 32.0, Stretch = Stretch.Uniform }
                        .Bind(Image.SourceProperty, b)
                        .Set(RenderOptions.BitmapScalingModeProperty, BitmapScalingMode.Linear));
                }); //Photo

                QuerySettings.RegisterPropertyFormat((CategoryEntity e) => e.Picture,  b =>
                {
                    b.Converter = SouthwindConverters.EmbeddedImageConverter;
                    return Fluent.GetDataTemplate(() => new Image { MaxHeight = 32.0, Stretch = Stretch.Uniform }
                        .Bind(Image.SourceProperty, b)
                        .Set(RenderOptions.BitmapScalingModeProperty, BitmapScalingMode.Linear));
                }); //Picture

                Constructor.Register(ctx => new EmployeeEntity { Address = new AddressEntity() });
                Constructor.Register(ctx => new PersonEntity { Address = new AddressEntity() });
                Constructor.Register(ctx => new CompanyEntity { Address = new AddressEntity() });
                Constructor.Register(ctx => new SupplierEntity { Address = new AddressEntity() });

                OperationClient.AddSettings(new List<OperationSettings>()
                {
                    new ConstructorOperationSettings<OrderEntity>(OrderOperation.Create)
                    {
                        Constructor = ctx=>
                        {
                            var cust = Finder.Find<CustomerEntity>(); // could return null, but we let it continue 

                            return OperationServer.Construct(OrderOperation.Create, cust);
                        },
                    },


                    new ContextualOperationSettings<ProductEntity>(OrderOperation.CreateOrderFromProducts)
                    {
                         Click = ctx =>
                         {
                             var cust = Finder.Find<CustomerEntity>(); // could return null, but we let it continue 

                             var result = OperationServer.ConstructFromMany(ctx.Entities, OrderOperation.CreateOrderFromProducts, cust);

                             Navigator.Navigate(result);
                         },
                    },

                    new EntityOperationSettings<OrderEntity>(OrderOperation.SaveNew){ IsVisible = ctx=> ctx.Entity.IsNew }, 
                    new EntityOperationSettings<OrderEntity>(OrderOperation.Save){ IsVisible = ctx=> !ctx.Entity.IsNew }, 

                    new EntityOperationSettings<OrderEntity>(OrderOperation.Cancel)
                    { 
                        ConfirmMessage = ctx=> ((OrderEntity)ctx.Entity).State == OrderState.Shipped ? OrderMessage.CancelShippedOrder0.NiceToString(ctx.Entity) : null 
                    }, 

                    new EntityOperationSettings<OrderEntity>(OrderOperation.Ship)
                    { 
                        Click = ctx =>
                        {
                            DateTime shipDate = DateTime.Now;
                            if (!ValueLineBox.Show(ref shipDate, 
                                labelText: DescriptionManager.NiceName((OrderEntity o) => o.ShippedDate), 
                                owner: Window.GetWindow(ctx.EntityControl)))
                                return null;
                            
                            try
                            {
                                return ctx.Entity.Execute(OrderOperation.Ship, shipDate); 
                            }
                            catch(IntegrityCheckException e)
                            {
                                ctx.Entity.SetGraphErrors(e);
                                throw e;
                            }
                        },

                        Contextual = 
                        { 
                            Click = ctx =>
                            {
                                DateTime shipDate = DateTime.Now;
                                if (!ValueLineBox.Show(ref shipDate, 
                                    labelText: DescriptionManager.NiceName((OrderEntity o) => o.ShippedDate), 
                                    owner: Window.GetWindow(ctx.SearchControl)))
                                    return;

                                ctx.Entities.SingleEx().ExecuteLite(OrderOperation.Ship, shipDate); 
                            }
                        }
                    }, 
                }); 

                //NotDefined
            }
        }
    }
}
