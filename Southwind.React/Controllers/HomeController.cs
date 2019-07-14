using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signum.React.Filters;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Southwind.React.Controllers
{
    public class HomeController : Controller
    {
        // GET: Default
        [SignumAllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }
    }
}
