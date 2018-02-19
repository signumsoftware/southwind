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
        public static void AssertRoslynIsPresent()
        {
            if (!File.Exists(@"bin\roslyn\csc.exe"))
            {
                SafeConsole.WriteLineColor(ConsoleColor.Yellow, $@"Dynamic requires roslyn compiler to be in {Directory.GetCurrentDirectory()}\bin\roslyn\csc.exe");
                
                var toolsPath = GetToolsPath();

                if (toolsPath != null)
                {
                    Directory.CreateDirectory(@"bin\roslyn\");

                    foreach (var file in Directory.GetFiles(toolsPath))
                        File.Copy(file, Path.Combine(@"bin\roslyn\", Path.GetFileName(file)));
                }
                else
                {
                    SafeConsole.WriteLineColor(ConsoleColor.Red, $@"Impossible to copy roslyn automatically from packages folder, you need to do it manually!");
                }
            }
        }

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

        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            DynamicLogic.Start(sb, dqm);
            DynamicSqlMigrationLogic.Start(sb, dqm);
            DynamicValidationLogic.Start(sb, dqm);
            DynamicViewLogic.Start(sb, dqm);
            DynamicTypeLogic.Start(sb, dqm);
            DynamicTypeConditionLogic.Start(sb, dqm);
            DynamicExpressionLogic.Start(sb, dqm);
            DynamicMixinConnectionLogic.Start(sb, dqm);

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
