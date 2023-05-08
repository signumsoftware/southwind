using Southwind.Customers;

namespace Southwind.Products;

[EntityKind(EntityKind.Main, EntityData.Master)]
public class SupplierEntity : Entity
{
    [UniqueIndex]
    [StringLengthValidator(Min = 3, Max = 40)]
    public string CompanyName { get; set; }

    [StringLengthValidator(Min = 3, Max = 30)]
    public string? ContactName { get; set; }

    [StringLengthValidator(Min = 3, Max = 30)]
    public string? ContactTitle { get; set; }

    public AddressEmbedded Address { get; set; }

    [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
    public string Phone { get; set; }

    [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
    public string Fax { get; set; }

    [StringLengthValidator(Min = 3, MultiLine = true)]
    public string? HomePage { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => CompanyName);
}


[AutoInit]
public static class SupplierOperation
{
    public static ExecuteSymbol<SupplierEntity> Save;
}
