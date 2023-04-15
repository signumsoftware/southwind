namespace Southwind.Shippers;

[EntityKind(EntityKind.Main, EntityData.Master)]
public class ShipperEntity : Entity
{
    [UniqueIndex]
    [StringLengthValidator(Min = 3, Max = 100)]
    public string CompanyName { get; set; }

    [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
    public string Phone { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => CompanyName);
}

[AutoInit]
public static class ShipperOperation
{
    public static ExecuteSymbol<ShipperEntity> Save;
}
