using Signum.Files;

namespace Southwind.Products;

[EntityKind(EntityKind.String, EntityData.Master), AllowUnauthenticated]
public class CategoryEntity : Entity
{
    [Translatable] //Localize categoryName column
    [UniqueIndex]
    [StringLengthValidator(Min = 3, Max = 100)]
    public string CategoryName { get; set; }

    [Translatable] //Localize description column
    [StringLengthValidator(Min = 3, MultiLine = true)]
    public string Description { get; set; }

    public FileEmbedded? Picture { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => CategoryName);
}

[AutoInit]
public static class CategoryOperation
{
    public static ExecuteSymbol<CategoryEntity> Save;
}
