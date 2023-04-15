namespace Southwind.Customer;

[EntityKind(EntityKind.Shared, EntityData.Transactional)]
public class CompanyEntity : CustomerEntity
{
    [StringLengthValidator(Min = 3, Max = 40)]
    public string CompanyName { get; set; }

    [StringLengthValidator(Min = 3, Max = 30)]
    public string ContactName { get; set; }

    [StringLengthValidator(Min = 3, Max = 30)]
    public string ContactTitle { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => CompanyName);
}
