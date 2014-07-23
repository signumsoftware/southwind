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

namespace Southwind.Web.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var panel = DashboardLogic.GetHomePageDashboard();
            if (panel != null)
                return View(DashboardClient.ViewPrefix.Formato("Dashboard"), panel);
            
            return View();
        }

        public ActionResult ChangeLanguage()
        {
            var ci = CultureInfo.GetCultureInfo(Request.Params["culture"]);

            if (UserDN.Current == null)
                this.Response.Cookies.Add(new HttpCookie("language", ci.Name) { Expires = DateTime.Now.AddMonths(6) });
            else
                UserDN.Current.CultureInfo = ci.ToCultureInfoDN();

            return Redirect(Request.UrlReferrer.ToString());
        } //ChangeLanguage
        public ActionResult ChangeTheme()
        {
            Session[SouthwindClient.ThemeSessionKey] = Request.Params["themeSelector"];
            return Redirect(Request.UrlReferrer.ToString());
        }

        public FileResult EmployeePhoto(Lite<EmployeeDN> employee)
        {
            return File(employee.InDB().Select(e => e.Photo).Single(), "image/jpeg");
        }

        public FileResult CategoryPhoto(Lite<CategoryDN> employee)
        {
            return File(employee.InDB().Select(e => e.Picture).Single(), "image/jpeg");
        }

        public ContentResult UpdateOrders()
        {
            int removed = Database.Query<OrderDN>().Where(a => a.Id > 11077).UnsafeDelete(); 

            DateTime time = Database.Query<OrderDN>().Max(a => a.OrderDate);

            var now = TimeZoneManager.Now;
            var ts = (int)(now - time).TotalDays;

            int updated = Database.Query<OrderDN>().UnsafeUpdate()
                .Set(o => o.OrderDate, o => o.OrderDate.AddDays(ts))
                .Set(o => o.ShippedDate, o => o.ShippedDate.Value.AddDays(ts))
                .Set(o => o.RequiredDate, o => o.RequiredDate.AddDays(ts))
                .Set(o => o.CancelationDate, o => null)
                .Execute();

            return Content("Removed: {0}\r\nUpdated: {1}".Formato(removed, updated)); 
        }
    }
}
