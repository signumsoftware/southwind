using Signum.MachineLearning;

namespace Southwind.Products;

[EntityKind(EntityKind.Main, EntityData.Master)]
public class ProductEntity : Entity
{
    [UniqueIndex]
    [StringLengthValidator(Min = 3, Max = 40)]
    public string ProductName { get; set; }

    public Lite<SupplierEntity> Supplier { get; set; }

    public Lite<CategoryEntity> Category { get; set; }

    [StringLengthValidator(Min = 3, Max = 20)]
    public string QuantityPerUnit { get; set; }

    decimal unitPrice;
    [NumberIsValidator(ComparisonType.GreaterThan, 0), Unit("$")]
    public decimal UnitPrice
    {
        get { return unitPrice; }
        set
        {
            if (Set(ref unitPrice, value))
                Notify(() => ValueInStock);
        }
    }

    short unitsInStock;
    [NumberIsValidator(ComparisonType.GreaterThanOrEqualTo, 0)]
    public short UnitsInStock
    {
        get { return unitsInStock; }
        set
        {
            if (Set(ref unitsInStock, value))
                Notify(() => ValueInStock);
        }
    }

    public int ReorderLevel { get; set; }

    public bool Discontinued { get; set; }

    [AutoExpressionField, Unit("$")]
    public decimal ValueInStock => As.Expression(() => unitPrice * unitsInStock);

    [PreserveOrder]
    [NoRepeatValidator]
    public MList<AdditionalInformationEmbedded> AdditionalInformation { get; set; } = new MList<AdditionalInformationEmbedded>();

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => ProductName);
}

[AllowUnathenticated]
public enum CatalogMessage
{
    ProductName,
    UnitPrice,
    QuantityPerUnit,
    UnitsInStock,
}

public class AdditionalInformationEmbedded : EmbeddedEntity
{
    [StringLengthValidator(Max = 100)]
    public string Key { get; set; }

    [StringLengthValidator(Max = 400)]
    public string Value { get; set; }
}

[AutoInit]
public static class ProductOperation
{
    public static ExecuteSymbol<ProductEntity> Save;
}



public enum ProductQuery
{
    CurrentProducts
}

[AutoInit]//Predictor
public static class ProductPredictorPublication
{
    public static PredictorPublicationSymbol MonthlySales;
}//Predictor
