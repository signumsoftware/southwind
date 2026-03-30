using System.Xml.Linq;
using Signum.Authorization;
using Signum.Engine.Maps;
using Signum.Engine.Sync;
using Signum.UserAssets;

namespace Southwind.Test.Environment;

public class EnvironmentTest
{
    [Fact]
    public void GenerateTestEnvironment()
    {
        var authRules = XDocument.Load(@"..\..\..\..\Southwind.Terminal\AuthRules.xml");

        SouthwindEnvironment.Start(includeDynamic: false);

        using (Administrator.WithSnapshotOrTemplateDatabase())
        {
            Administrator.TotalGeneration();

            Schema.Current.Initialize();

            OperationLogic.AllowSaveGlobally = true;

            using (AuthLogic.Disable())
            {
                AuthLogic.LoadRoles(authRules);
                AuthLogic.ImportAuthRules(authRules, interactive: false);
                SouthwindEnvironment.LoadBasics();
                SouthwindEnvironment.LoadEmployees();
                SouthwindEnvironment.LoadUsers();
                SouthwindEnvironment.LoadProducts();
                SouthwindEnvironment.LoadCustomers();
                SouthwindEnvironment.LoadShippers();
            }
            using (AuthLogic.UnsafeUserSession("System"))
                UserAssetsImporter.ImportAll(@"..\..\..\..\Southwind.Terminal\Toolbar.xml");

            OperationLogic.AllowSaveGlobally = false;
        }
    }
}
