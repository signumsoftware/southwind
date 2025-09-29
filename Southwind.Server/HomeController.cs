
using Microsoft.AspNetCore.Mvc;
using Signum.API.Filters;

namespace Southwind;

public class HomeController : Controller
{
    // GET: Default
    [SignumAllowAnonymous]
    public ActionResult Index()
    {
        return View("~/Index.cshtml");
    }
}
