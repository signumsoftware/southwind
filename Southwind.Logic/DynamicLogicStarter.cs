using Signum.Engine.Dynamic;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Maps;
using Signum.Entities.Dynamic;
using Signum.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Southwind.Logic
{
    public class DynamicLogicStarter
    {
        private static string GetToolsPath()
        {   
            if (!Directory.Exists(@"..\..\..\packages"))
                return null;

            var dir = Directory.GetDirectories(@"..\..\..\packages", "Microsoft.Net.Compilers.*").SingleOrDefaultEx();

            var result = Path.Combine(dir, "tools");

            if (Directory.Exists(result))
                return result;

            return null;
        }

        public static void Start(SchemaBuilder sb)
        {
            DynamicLogic.Start(sb);
            DynamicSqlMigrationLogic.Start(sb);
            DynamicValidationLogic.Start(sb);
            DynamicViewLogic.Start(sb);
            DynamicTypeLogic.Start(sb);
            DynamicTypeConditionLogic.Start(sb);
            DynamicExpressionLogic.Start(sb);
            DynamicMixinConnectionLogic.Start(sb);

            DynamicCode.Namespaces.AddRange(new HashSet<string>
            {
                "Southwind.Entities",
                "Southwind.Logic",
            });

            DynamicCode.Assemblies.AddRange(new HashSet<string>
            {
                "Southwind.Entities.dll",
                "Southwind.Logic.dll",
            });
        }

        
    }
}
