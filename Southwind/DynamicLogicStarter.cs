using Signum.Authorization;
using Signum.Dynamic;
using Signum.Dynamic.Expression;
using Signum.Dynamic.Mixins;
using Signum.Dynamic.SqlMigrations;
using Signum.Dynamic.Types;
using Signum.Dynamic.Validations;
using Signum.Dynamic.Views;
using Signum.Eval;
using Southwind.Globals;

namespace Southwind;

public class DynamicLogicStarter
{
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

        EvalLogic.Namespaces.AddRange(new HashSet<string>
        {
            "Southwind",
            "Southwind",
        });

        EvalLogic.AssemblyTypes.AddRange(new HashSet<Type>
        {
            typeof(Database),
        });

        EvalLogic.AddFullAssembly(typeof(Entity));
        EvalLogic.AddFullAssembly(typeof(Database));
        EvalLogic.AddFullAssembly(typeof(AuthLogic));
        EvalLogic.AddFullAssembly(typeof(UserEntity));
        EvalLogic.AddFullAssembly(typeof(ApplicationConfigurationEntity));
        EvalLogic.AddFullAssembly(typeof(Starter));

    }


}
