using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Signum.Utilities;
using Signum.Entities;
using Signum.Engine;
using Signum.Web;
using Southwind.Entities;
using Southwind.Logic;
using Southwind.Web;
using Signum.Entities.Authorization;
using Signum.Engine.Authorization;
using Signum.Engine.Dashboard;
using Signum.Web.Dashboard;
using System.Globalization;
using Signum.Engine.Basics;
using Signum.Engine.Operations;
using Signum.Web.Operations;
using Signum.Entities.Reflection;

namespace Southwind.Web.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        [AuthenticationRequired(false)]
        public ActionResult Index()
        {
            if (UserEntity.Current == null)
                return RedirectToAction("PublicCatalog");

            var panel = DashboardLogic.GetHomePageDashboard();
            if (panel != null)
                return View(DashboardClient.ViewPrefix.FormatWith("Dashboard"), panel);
            
            return View();
        }

        [AuthenticationRequired(false)]
        public ActionResult ChangeLanguage()
        {
            var ci = CultureInfo.GetCultureInfo(Request.Params["culture"]);

            if (UserEntity.Current == null)
                this.Response.Cookies.Add(new HttpCookie("language", ci.Name) { Expires = DateTime.Now.AddMonths(6) });
            else
            {
                UserEntity.Current.CultureInfo = ci.ToCultureInfoEntity();
                using (AuthLogic.Disable())
                using (OperationLogic.AllowSave<UserEntity>())
                    UserEntity.Current.Save();
            }

            return Redirect(Request.UrlReferrer.ToString());
        } //ChangeLanguage

        [AuthenticationRequired(false)]
        public ActionResult PublicCatalog()
        {
            return View();
        } //PublicCatalog

        [AuthenticationRequired(false)]
        public ActionResult ChangeTheme()
        {
            Session[SouthwindClient.ThemeSessionKey] = Request.Params["themeSelector"];
            return Redirect(Request.UrlReferrer.ToString());
        }

        public ContentResult UpdateOrders() //To move orders to the present
        {
            int removed = Database.Query<OrderEntity>().Where(a => a.Id > 11077).UnsafeDelete(); 

            DateTime time = Database.Query<OrderEntity>().Max(a => a.OrderDate);

            var now = TimeZoneManager.Now;
            var ts = (int)(now - time).TotalDays;

            int updated = Database.Query<OrderEntity>().UnsafeUpdate()
                .Set(o => o.OrderDate, o => o.OrderDate.AddDays(ts))
                .Set(o => o.ShippedDate, o => o.ShippedDate.Value.AddDays(ts))
                .Set(o => o.RequiredDate, o => o.RequiredDate.AddDays(ts))
                .Set(o => o.CancelationDate, o => null)
                .Execute();

            return Content("Removed: {0}\r\nUpdated: {1}".FormatWith(removed, updated)); 
        }

        public ActionResult CreateOrderFromProducts()
        {
            Lite<CustomerEntity> customer = this.TryParseLite<CustomerEntity>("customer");

            var products = this.ParseLiteKeys<ProductEntity>(); 

            var order = OperationLogic.ConstructFromMany(products, OrderOperation.CreateOrderFromProducts, customer);

            return this.DefaultConstructResult(order);
        }

        public ActionResult ShipOrder()
        {
            MappingContext<OrderEntity> ctx = this.ExtractEntity<OrderEntity>().ApplyChanges(this);

            if (ctx.HasErrors())
                return ctx.ToJsonModelState();

            var shipDate = this.ParseValue<DateTime>("shipDate");

            try
            {
                ctx.Value.Execute(OrderOperation.Ship, shipDate);
            }
            catch (IntegrityCheckException e)
            {
                ctx.ImportErrors(e.Errors);

                return ctx.ToJsonModelState();
            }

            return this.DefaultExecuteResult(ctx.Value);
        }//ShipOrder
    }
}
