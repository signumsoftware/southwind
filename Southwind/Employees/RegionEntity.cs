namespace Southwind.Employees;

[EntityKind(EntityKind.String, EntityData.Master)]
public class RegionEntity : Entity
{
    [UniqueIndex]
    [StringLengthValidator(Min = 3, Max = 50)]
    public string Description { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => Description);
}

[AutoInit]
public static class RegionOperation
{
    public static ExecuteSymbol<RegionEntity> Save;
}

