using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using System.Linq.Expressions;
using Signum.Utilities;
using Signum.Entities.Translation;
using Signum.Entities.Files;
using Signum.Utilities.ExpressionTrees;
using Signum.Entities.MachineLearning;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class ProductEntity : Entity
    {
        [UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string ProductName { get; set; }

        [NotNullValidator]
        public Lite<SupplierEntity> Supplier { get; set; }

        [NotNullValidator]
        public Lite<CategoryEntity> Category { get; set; }

        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 20)]
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

        static Expression<Func<ProductEntity, decimal>> ValueInStockExpression =
            p => p.unitPrice * p.unitsInStock;
        [ExpressionField, Unit("$")]
        public decimal ValueInStock
        {
            get { return ValueInStockExpression.Evaluate(this); }
        }

        static Expression<Func<ProductEntity, string>> ToStringExpression = e => e.ProductName;
        [ExpressionField]
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class ProductOperation
    {
        public static ExecuteSymbol<ProductEntity> Save;
    }

    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class SupplierEntity : Entity
    {
        [UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string CompanyName { get; set; }

        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 30)]
        public string ContactName { get; set; }

        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 30)]
        public string ContactTitle { get; set; }

        [NotNullValidator]
        public AddressEmbedded Address { get; set; }

        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone { get; set; }

        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Fax { get; set; }

        [StringLengthValidator(AllowNulls = true, Min = 3, MultiLine = true)]
        public string HomePage { get; set; }

        static Expression<Func<SupplierEntity, string>> ToStringExpression = e => e.CompanyName;
        [ExpressionField]
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class SupplierOperation
    {
        public static ExecuteSymbol<SupplierEntity> Save;
    }

    [Serializable, EntityKind(EntityKind.String, EntityData.Master)]
    public class CategoryEntity : Entity
    {
        [TranslateField] //Localize categoryName column
        [UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string CategoryName { get; set; }

        [TranslateField] //Localize description column
        [StringLengthValidator(AllowNulls = false, Min = 3, MultiLine = true)]
        public string Description { get; set; }

        public FileEmbedded Picture { get; set; }

        static Expression<Func<CategoryEntity, string>> ToStringExpression = e => e.CategoryName;
        [ExpressionField]
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class CategoryOperation
    {
        public static ExecuteSymbol<CategoryEntity> Save;
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
}
