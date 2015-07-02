using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Automation;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Signum.Engine.Authorization;
using Signum.Engine.Basics;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Utilities;
using Signum.Windows.UIAutomation;
using Southwind.Entities;

namespace Southwind.Test.Windows
{
    public static class Common
    {
        public static MainWindowProxy OpenAndLogin(string userName, string password)
        {
            AutomationElement loginElement = FindOpenWindow("Welcome to Southwind");

            Process process = null;
            if (loginElement == null)
            {
                process = Process.Start(@"D:\Signum\Southwind\Southwind.Windows\bin\Debug\Southwind.Windows.exe");

                process.WaitForInputIdle();
                loginElement = AutomationElement.RootElement.WaitChild(a => a.Current.ProcessId == process.Id && a.Current.ClassName == "Login", 5000);
            }

            var result = new MainWindowProxy(LoginWindowProxy.LoginAndContinue(loginElement, userName, password));

            if (process != null)
                result.Disposed += () => process.Kill();

            CultureInfoEntity culture = AuthLogic.RetrieveUser(userName).CultureInfo;

            Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = culture?.ToCultureInfo() ?? new CultureInfo("en-US");

            return result;
        }

        private static AutomationElement FindOpenWindow(string name)
        {
            var win = AutomationElement.RootElement.TryChild(a => a.Current.Name == name);

            if (win != null)
                return win;
            return null;
        }


        public static DetailGridProxy DetailGrid(this ILineContainer<OrderEntity> container)
        {
            PropertyRoute route = container.GetRoute((OrderEntity o) => o.Details);

            var grid = container.Element.Element(TreeScope.Descendants, a => a.Current.ClassName == "ImmediateGrid" && a.Current.Name == route.ToString());

            return new DetailGridProxy(grid);
        }//DetailGrid
    }

    public class DetailGridProxy
    {
        public AutomationElement Element { get; private set; }

        public DetailGridProxy(AutomationElement element)
        {
            this.Element = element;
        }

        public DetailGridRowProxy AddRow(Lite<ProductEntity> product)
        {
            var buttons = this.Element.Parent().Child(a => a.Current.ClassName == "EntityButtons");

            using (SearchWindowProxy sw = buttons.ChildById("btFind").ButtonInvokeCapture().ToSearchWindow())
            {
                sw.Search();
                sw.SearchControl.GetRows().Single(a => a.Entity.Is(product)).Select();
                sw.Ok();
            }

            return Rows().Last();
        }

        private List<DetailGridRowProxy> Rows()
        {
            return this.Element.Children(e => e.Current.ClassName == "DataGridRow" && e.Current.Name != "{NewItemPlaceholder}")
                .Select(a => new DetailGridRowProxy(a)).ToList();
        }
    }

    public class DetailGridRowProxy
    {
        public AutomationElement Element { get; private set; }
        public List<AutomationElement> Cells { get; private set; }

        public DetailGridRowProxy(AutomationElement element)
        {
            this.Element = element;

            this.Cells = element.Children(a => a.Current.ClassName == "DataGridCell");

            Assert.AreEqual(5, this.Cells.Count);
        }

        public DetailGridRowProxy SetProduct(Lite<ProductEntity> product)
        {
            this.SetProduct(product.ToString());

            return this;
        }

        public DetailGridRowProxy SetProduct(string productName)
        {
            Cells[0].ButtonInvoke();

            var autoComplete = Cells[0].Child(a => a.Current.ClassName == "AutocompleteTextBox");

            autoComplete.Value(productName);

            var win = autoComplete.Parent(ae => ae.Current.ClassName == "NormalWindow");

            var lb = win.WaitDescendantById("lstBox", EntityLineProxy.AutoCompleteTimeout);

            lb.SelectListItemByName(productName, () => "DetailGridProxy.AddRow");

            return this;
        }

        public DetailGridRowProxy SetQuantity(int quantity)
        {
            Cells[2].Value(quantity.ToString());

            return this;
        }

        public DetailGridRowProxy SetDiscount(decimal discount)
        {
            Cells[3].Value(discount.ToString());

            return this;
        }
    }//DetailGridRowProxy
}
