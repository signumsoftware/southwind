using Southwind.Globals;

namespace Southwind.Customer;

[PrimaryKey(typeof(Guid))]
public abstract class CustomerEntity : Entity
{
    public AddressEmbedded Address { get; set; }

    [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
    public string Phone { get; set; }

    [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
    public string? Fax { get; set; }
}


public enum CustomerQuery
{
    Customer
}

[AutoInit]
public static class CustomerOperation
{
    public static ExecuteSymbol<CustomerEntity> Save;
}
