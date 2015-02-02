using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium.Chrome;
using Signum.Web.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium;

namespace Southwind.Test.Web
{
    [TestClass]
    [DeploymentItem("chromedriver.exe", "")]
    public class Common : SeleniumTestClass
    {
        protected override string Url(string url)
        {
            //return "http://localhost/Southwind.Web/" + url;
            return "http://localhost:7654/" + url;
        }

        public static void Start(TestContext testContext)
        {
            selenium = new ChromeDriver(); //new FirefoxDriver();
        }

        public override void Login(string username, string password)
        {
            base.Login(username, password);

            string culture = selenium.FindElement(By.Id("languageSelector")).SelectElement().SelectedOption.GetAttribute("value");

            Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo(culture);
        }

        protected static void MyTestCleanup()
        {
            selenium.Close();
        }
    }
}
