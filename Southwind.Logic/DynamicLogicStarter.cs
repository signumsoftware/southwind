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
