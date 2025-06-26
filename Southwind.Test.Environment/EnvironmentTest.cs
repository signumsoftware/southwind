using System.IO;
using System.Xml.Linq;
using Signum.Authorization;
using Signum.Engine.Maps;
using Signum.Engine.Sync;
using Southwind;

namespace Southwind.Test.Environment;

public class EnvironmentTest
{
    [Fact]
    public void GenerateTestEnvironment()
    {
        var authRules = XDocument.Load(@"..\..\..\..\Southwind.Terminal\AuthRules.xml");

        SouthwindEnvironment.Start(includeDynamic: false);

        Administrator.TotalGeneration();

        Schema.Current.Initialize();

        OperationLogic.AllowSaveGlobally = true;

        using (AuthLogic.Disable())
        {
            AuthLogic.LoadRoles(authRules);
            SouthwindEnvironment.LoadBasics();
            SouthwindEnvironment.LoadEmployees();
            SouthwindEnvironment.LoadUsers();
            SouthwindEnvironment.LoadProducts();
            SouthwindEnvironment.LoadCustomers();
            SouthwindEnvironment.LoadShippers();
            
            AuthLogic.ImportRulesScript(authRules, interactive: false)!.PlainSqlCommand().ExecuteLeaves();
        }

        OperationLogic.AllowSaveGlobally = false;
    }
}
