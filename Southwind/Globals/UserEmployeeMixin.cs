using Southwind.Employees;

namespace Southwind.Globals;

public class UserEmployeeMixin : MixinEntity
{
    protected UserEmployeeMixin(ModifiableEntity mainEntity, MixinEntity next)
        : base(mainEntity, next)
    {
    }

    public Lite<EmployeeEntity>? Employee { get; set; }
}
