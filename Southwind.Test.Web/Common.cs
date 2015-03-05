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
using OpenQA.Selenium.Remote;

namespace Southwind.Test.Web
{
    [TestClass]
    [DeploymentItem("chromedriver.exe", "")]
    public class SouthwindTestClass
    {
        public static void Browse(string username, Action<SouthwindBrowser> action)
        {
            var selenium = new ChromeDriver();

            var browser = new SouthwindBrowser(selenium);
            try
            {
                browser.Login(username, username);
                action(browser);
            }
            catch (UnhandledAlertException e)
            {
                selenium.SwitchTo().Alert();

            }
            finally
            {
                selenium.Close();
            }
        }
    }

    public class SouthwindBrowser : BrowserProxy
    {
        protected override string Url(string url)
        {
            //return "http://localhost/Southwind.Web/" + url;
            return "http://localhost:7654/" + url;
        }

        public SouthwindBrowser(RemoteWebDriver driver)
            : base(driver)
        {
        }

        public override void Login(string username, string password)
        {
            base.Login(username, password);

            string culture = Selenium.FindElement(By.Id("languageSelector")).SelectElement().SelectedOption.GetAttribute("value");

            Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo(culture);
        }

    }
}
