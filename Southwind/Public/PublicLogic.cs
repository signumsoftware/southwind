using Signum.API;

namespace Southwind.Public;

public static class PublicLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.AlreadyDefined(MethodInfo.GetCurrentMethod()))
            return;

        if (sb.WebServerBuilder != null)
            ReflectionServer.RegisterLike(typeof(RegisterUserModel), () => true);
    }
}
