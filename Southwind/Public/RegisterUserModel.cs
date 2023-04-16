using Signum.Authorization;
using Southwind.Employees;
using Southwind.Globals;

namespace Southwind.Public;

[AllowUnathenticated]
public class RegisterUserModel : ModelEntity
{
    public Lite<EmployeeEntity>? ReportsTo { get; set; }

    [StringLengthValidator(Max = 100)]
    public string TitleOfCourtesy { get; set; }

    [StringLengthValidator(Max = 100)]
    public string FirstName { get; set; }

    [StringLengthValidator(Max = 100)]
    public string LastName { get; set; }

    public AddressEmbedded Address { get; set; }

    [StringLengthValidator(Max = 100)]
    public string Username { get; set; }

    [StringLengthValidator(Max = 100), EMailValidator, Description("E-Mail")]
    public string EMail { get; set; }

    public string Password { get; set; }

    protected override string? PropertyValidation(PropertyInfo pi)
    {
        if (pi.Name == nameof(Password))
            return UserEntity.OnValidatePassword(Password);

        return base.PropertyValidation(pi);
    }
}
