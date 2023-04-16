namespace Southwind.Public;

[AllowUnathenticated]
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
