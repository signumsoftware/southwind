using System;
using System.IO;
using System.Reflection;
using System.Xml.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Engine.Maps;
using Signum.Engine.Operations;
using Signum.Utilities;
using Southwind.Logic;
using Southwind.Test.Environment.Properties;

namespace Southwind.Test.Environment
{
    [TestClass]
    public class EnvironmentTest
    {
        [TestMethod]
        public void GenerateEnvironment()
        {
            var authRules = XDocument.Load(@"..\..\..\Southwind.Load\AuthRules.xml");

            SouthwindEnvironment.Start();

            Administrator.TotalGeneration();

            Schema.Current.Initialize();

            OperationLogic.AllowSaveGlobally = true;

            using (AuthLogic.Disable())
            {
                SouthwindEnvironment.LoadBasics();

                AuthLogic.LoadRoles(authRules);
                SouthwindEnvironment.LoadEmployees();
                SouthwindEnvironment.LoadUsers();
                SouthwindEnvironment.LoadProducts(); 
                SouthwindEnvironment.LoadCustomers(); 
                SouthwindEnvironment.LoadShippers();

                AuthLogic.ImportRulesScript(authRules, interactive: false).PlainSqlCommand().ExecuteLeaves();
            }

            OperationLogic.AllowSaveGlobally = false;
        }
    }
}
