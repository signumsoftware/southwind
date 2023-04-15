namespace Southwind.Employees;

[EntityKind(EntityKind.String, EntityData.Master)]
public class TerritoryEntity : Entity
{
    public RegionEntity Region { get; set; }

    [UniqueIndex]
    [StringLengthValidator(Min = 3, Max = 100)]
    public string Description { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => Description);
}

[AutoInit]
public static class TerritoryOperation
{
    public static ExecuteSymbol<TerritoryEntity> Save;
}
