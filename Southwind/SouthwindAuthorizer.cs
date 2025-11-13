using Signum.Authorization;
using Signum.Authorization.AzureAD;
using Signum.Authorization.AzureAD.Authorizer;

namespace Southwind;

internal class SouthwindAuthorizer : AzureADAuthorizer
{
    public SouthwindAuthorizer(Func<AzureADConfigurationEmbedded?> getConfig) : base(getConfig)
    {
    }

    public override void UpdateUserInternal(UserEntity user, IAutoCreateUserContext ctx)
    {
        base.UpdateUserInternal(user, ctx);

        //user.Mixin<UserADMixin>().FirstName = ctx.FirstName;
    }
}
