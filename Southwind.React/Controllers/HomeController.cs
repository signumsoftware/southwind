using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Southwind.React.Controllers
{
    public class HomeController : Controller
    {
        // GET: Default
        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }
    }
}