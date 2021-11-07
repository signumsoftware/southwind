using Signum.Engine;
using Signum.Engine.Authorization;
using Signum.Engine.Dynamic;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Maps;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Entities.Dynamic;
using Signum.Utilities;
using Southwind.Entities;
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
        public static void Start(SchemaBuilder sb)
        {
            DynamicLogic.Start(sb, withCodeGen: true);
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

            DynamicCode.AssemblyTypes.AddRange(new HashSet<Type>
            {
                typeof(Database),
            });

            DynamicCode.AddFullAssembly(typeof(Entity));
            DynamicCode.AddFullAssembly(typeof(Database));
            DynamicCode.AddFullAssembly(typeof(AuthLogic));
            DynamicCode.AddFullAssembly(typeof(UserEntity));
            DynamicCode.AddFullAssembly(typeof(ApplicationConfigurationEntity));
            DynamicCode.AddFullAssembly(typeof(Starter));

        }


    }
}
