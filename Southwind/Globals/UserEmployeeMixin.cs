using Southwind.Entities.Employees;

namespace Southwind.Entities.Globals;

public class UserEmployeeMixin : MixinEntity
{
    protected UserEmployeeMixin(ModifiableEntity mainEntity, MixinEntity next)
        : base(mainEntity, next)
    {
    }

    public Lite<EmployeeEntity>? Employee { get; set; }
}
