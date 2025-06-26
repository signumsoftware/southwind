using Signum.Authorization;
using Southwind.Customers;
using Southwind.Employees;

namespace Southwind.Public;

[AllowUnauthenticated]
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

[AllowUnauthenticated]
public enum RegisterUserMessage
{
    [Description("Please fill the following form to register a new Southwind Employee")]
    PleaseFillTheFollowingFormToRegisterANewSouthwindEmployee,

    [Description("Register")]
    Register,

    UserRegistered,

    [Description("User {0} has been registered successfully!")]
    User0HasBeenRegisteredSuccessfully,

    [Description("Go to Login page")]
    GoToLoginPage,

    [Description("User {0} is already registered")]
    User0IsAlreadyRegistered,
}
