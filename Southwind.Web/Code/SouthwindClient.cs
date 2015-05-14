using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using Signum.Web;
using Signum.Utilities;
using Southwind.Entities;
using System.Web.Mvc;
using System.Drawing;
using System.IO;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Engine;
using Signum.Entities.Basics;
using Signum.Entities.SMS;
using Signum.Entities.Mailing;
using Signum.Entities.Files;
using Signum.Web.Files;
using Signum.Web.Operations;
using Southwind.Web.Controllers;
using Signum.Engine.Operations;
using System.Web.Mvc.Html;

namespace Southwind.Web
{
    public static class SouthwindClient
    {
        public static string ViewPrefix = "~/Views/Southwind/{0}.cshtml";
        public static string ThemeSessionKey = "swCurrentTheme";

        public static JsModule OrderModule = new JsModule("Order");
        public static JsModule ProductModule = new JsModule("Product");

        public static void Start()
        {
            if (Navigator.Manager.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                Navigator.AddSettings(new List<EntitySettings>
                {
                    new EmbeddedEntitySettings<AddressEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Address") },

                    new EntitySettings<TerritoryEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Territory") },
                    new EntitySettings<RegionEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Region") },
                    new EntitySettings<EmployeeEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Employee") },

                    new EntitySettings<SupplierEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Supplier") },
                    new EntitySettings<ProductEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Product") },
                    new EntitySettings<CategoryEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Category") },

                    new EntitySettings<PersonEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Person") },
                    new EntitySettings<CompanyEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Company") },
                   
                    new EntitySettings<OrderEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Order") },
                    new EmbeddedEntitySettings<OrderDetailsEntity> { PartialViewName = e => ViewPrefix.FormatWith("OrderDetails") },
                    new EntitySettings<ShipperEntity>() { PartialViewName = e => ViewPrefix.FormatWith("Shipper") },

                    new EmbeddedEntitySettings<OrderFilterModel>(),

                    new EntitySettings<ApplicationConfigurationEntity>() { PartialViewName = e => ViewPrefix.FormatWith("ApplicationConfiguration") },
                });

                Constructor.Register(ctx => new ApplicationConfigurationEntity
                {
                    Sms = new SMSConfigurationEntity(),
                    Email = new EmailConfigurationEntity()
                });

                QuerySettings.RegisterPropertyFormat((CategoryEntity e) => e.Picture,
                    new CellFormatter((html, obj) => obj == null ? null :
                        new HtmlTag("img")
                       .Attr("src", Base64Data((EmbeddedFileEntity)obj))
                      .Attr("alt", obj.ToString())
                      .Attr("style", "width:48px").ToHtmlSelf()) { TextAlign = "center" }); // Category

                QuerySettings.RegisterPropertyFormat((EmployeeEntity e) => e.Photo,
                    new CellFormatter((html, obj) => obj == null ? null :
                      new HtmlTag("img")
                      .Attr("src", RouteHelper.New().Action((FileController c) => c.Download(new RuntimeInfo((Lite<FileEntity>)obj).ToString())))
                      .Attr("alt", obj.ToString())
                      .Attr("style", "width:48px").ToHtmlSelf()) { TextAlign = "center" }); //Emmployee


                Finder.AddQuerySetting(new QuerySettings(OrderQuery.OrderSimple)
                {
                    SimpleFilterBuilder = new SimpleFilterBuilder(
                        (html, ctx, querySettings) => html.Partial(SouthwindClient.ViewPrefix.FormatWith("OrderFilter"),
                            new TypeContext<OrderFilterModel>(new OrderFilterModel(), ctx.Prefix)),
                        url => url.Action((HomeController s) => s.OrderFilterFilters()))
                });

                Constructor.Register(ctx => new EmployeeEntity { Address = new AddressEntity() });
                Constructor.Register(ctx => new PersonEntity { Address = new AddressEntity() });
                Constructor.Register(ctx => new CompanyEntity { Address = new AddressEntity() });
                Constructor.Register(ctx => new SupplierEntity { Address = new AddressEntity() });

                OperationClient.AddSettings(new List<OperationSettings>()
                {
                    new ConstructorOperationSettings<OrderEntity>(OrderOperation.Create)
                    {
                         ClientConstructor = ctx => OrderModule["createOrder"](ClientConstructorManager.ExtraJsonParams, 
                             new FindOptions(typeof(CustomerEntity)){ SearchOnLoad = true }.ToJS(ctx.ClientConstructorContext.Prefix, "cust")),
                         
                         Constructor = ctx=>
                         {
                             var cust = ctx.ConstructorContext.Controller.TryParseLite<CustomerEntity>("customer");

                             return OperationLogic.Construct(OrderOperation.Create, cust);
                         }
                    },

                    new ContextualOperationSettings<ProductEntity>(OrderOperation.CreateOrderFromProducts)
                    {
                         Click = ctx => OrderModule["createOrderFromProducts"](ctx.Options(), 
                             new FindOptions(typeof(CustomerEntity)){ SearchOnLoad = true }.ToJS(ctx.Prefix, "cust"), 
                              ctx.Url.Action((HomeController c)=>c.CreateOrderFromProducts()), 
                             JsFunction.Event)
                    },

                    new EntityOperationSettings<OrderEntity>(OrderOperation.SaveNew){ IsVisible = ctx=> ctx.Entity.IsNew }, 
                    new EntityOperationSettings<OrderEntity>(OrderOperation.Save){ IsVisible = ctx=> !ctx.Entity.IsNew }, 

                    new EntityOperationSettings<OrderEntity>(OrderOperation.Cancel)
                    { 
                        ConfirmMessage = ctx => ((OrderEntity)ctx.Entity).State == OrderState.Shipped ? OrderMessage.CancelShippedOrder0.NiceToString(ctx.Entity) : null 
                    }, 

                    new EntityOperationSettings<OrderEntity>(OrderOperation.Ship)
                    { 
                        Click = ctx => OrderModule["shipOrder"](ctx.Options(), 
                            ctx.Url.Action((HomeController c)=>c.ShipOrder()), 
                            GetValueLineOptions(ctx.Prefix), 
                            false),

                        Contextual = 
                        { 
                            Click = ctx => OrderModule["shipOrder"](ctx.Options(), 
                                ctx.Url.Action((HomeController c)=>c.ShipOrder()), 
                                GetValueLineOptions(ctx.Prefix), 
                                true),
                        }
                    }, 
                });

                RegisterQuickLinks();
            }
        }

        private static ValueLineBoxOptions GetValueLineOptions(string prefix)
        {
            return new ValueLineBoxOptions(ValueLineType.DateTime, prefix)
            {
                labelText = DescriptionManager.NiceName((OrderEntity o) => o.ShippedDate),
                value = DateTime.Now
            };
        }

        private static void RegisterQuickLinks()
        {
            LinksClient.RegisterEntityLinks<UserEntity>((entity, ctx) => new[]
                {
                    new QuickLinkExplore(typeof(OperationLogEntity), "User", entity)
                });

            LinksClient.RegisterEntityLinks<EmployeeEntity>((entity, ctx) =>
            {
                var links = new List<QuickLink>()
                {
                    new QuickLinkExplore(typeof(OrderEntity), "Employee", entity)  
                };

                var user = Database.Query<UserEntity>()
                    .Where(u => entity.RefersTo(u.Mixin<UserEmployeeMixin>().Employee))
                    .Select(u => u.ToLite())
                    .FirstOrDefault();
                if (user != null)
                    links.Add(new QuickLinkView(user));

                return links.ToArray();
            });

            LinksClient.RegisterEntityLinks<CategoryEntity>((entity, ctx) => new[]
            {
                new QuickLinkExplore(typeof(ProductEntity), "Category", entity)
            });

            LinksClient.RegisterEntityLinks<SupplierEntity>((entity, ctx) => new[]
            {
                new QuickLinkExplore(typeof(ProductEntity), "Supplier", entity)
            });

            LinksClient.RegisterEntityLinks<PersonEntity>((entity, ctx) => new[]
            {
                new QuickLinkExplore(typeof(OrderEntity), "Customer", entity)
            });

            LinksClient.RegisterEntityLinks<CompanyEntity>((entity, ctx) => new[]
            {
                new QuickLinkExplore(typeof(OrderEntity), "Customer", entity)
            });
        } //RegisterQuickLinks

        public static string Base64Data(EmbeddedFileEntity file)
        {
            return "data:" + MimeType.FromFileName(file.FileName) + ";base64," + Convert.ToBase64String(file.BinaryFile);
        } //Base64Data
    }
}