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

namespace Southwind.Web.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}
