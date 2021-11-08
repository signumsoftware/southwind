
namespace Southwind.React.Controllers;

public class HomeController : Controller
{
    // GET: Default
    [SignumAllowAnonymous]
    public ActionResult Index()
    {
        return View();
    }
}
