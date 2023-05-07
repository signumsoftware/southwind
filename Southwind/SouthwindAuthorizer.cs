using Signum.Engine.Authorization;
using Signum.Entities.Authorization;

namespace Southwind.Logic;

internal class SouthwindAuthorizer : ActiveDirectoryAuthorizer
{
    public SouthwindAuthorizer(Func<ActiveDirectoryConfigurationEmbedded> getConfig) : base(getConfig)
    {
    }

    public override void UpdateUserInternal(UserEntity user, IAutoCreateUserContext ctx)
    {
        base.UpdateUserInternal(user, ctx);

        //user.Mixin<UserADMixin>().FirstName = ctx.FirstName;
    }
}
