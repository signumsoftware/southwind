using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Signum.Web.Selenium;

namespace Southwind.Test.Web
{
    [TestClass]
    public class Common : SeleniumTestClass
    {
        protected override string Url(string url)
        {
            return "http://localhost/Southwind.Web/" + url;
        }

        public static void Start(TestContext testContext)
        {
            SeleniumExtensions.Explorer = WebExplorer.Firefox;
            SeleniumTestClass.LaunchSelenium();
        }

        public override void Login(string username, string password)
        {
            base.Login(username, password);

            string culture = selenium.GetValue("languageSelector");

            Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo(culture);
        }
    }
}
