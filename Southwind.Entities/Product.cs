using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using System.Linq.Expressions;
using Signum.Utilities;
using Signum.Entities.Translation;
using Signum.Entities.Files;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class ProductEntity : Entity
    {
        [NotNullable, SqlDbType(Size = 40), UniqueIndex]
        string productName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string ProductName
        {
            get { return productName; }
            set { SetToStr(ref productName, value); }
        }

        Lite<SupplierEntity> supplier;
        [NotNullValidator]
        public Lite<SupplierEntity> Supplier
        {
            get { return supplier; }
            set { Set(ref supplier, value); }
        }

        Lite<CategoryEntity> category;
        [NotNullValidator]
        public Lite<CategoryEntity> Category
        {
            get { return category; }
            set { Set(ref category, value); }
        }

        [NotNullable, SqlDbType(Size = 20)]
        string quantityPerUnit;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 20)]
        public string QuantityPerUnit
        {
            get { return quantityPerUnit; }
            set { Set(ref quantityPerUnit, value); }
        }

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

        int reorderLevel;
        public int ReorderLevel
        {
            get { return reorderLevel; }
            set { Set(ref reorderLevel, value); }
        }

        bool discontinued;
        public bool Discontinued
        {
            get { return discontinued; }
            set { Set(ref discontinued, value); }
        }

        static Expression<Func<ProductEntity, decimal>> ValueInStockExpression =
            p => p.unitPrice * p.unitsInStock;
        [Unit("$")]
        public decimal ValueInStock
        {
            get { return ValueInStockExpression.Evaluate(this); }
        }

        static Expression<Func<ProductEntity, string>> ToStringExpression = e => e.ProductName;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    public static class ProductOperation
    {
        public static readonly ExecuteSymbol<ProductEntity> Save = OperationSymbol.Execute<ProductEntity>();
    }

    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class SupplierEntity : Entity
    {
        [NotNullable, SqlDbType(Size = 40), UniqueIndex]
        string companyName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string CompanyName
        {
            get { return companyName; }
            set { SetToStr(ref companyName, value); }
        }

        [SqlDbType(Size = 30)]
        string contactName;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 30)]
        public string ContactName
        {
            get { return contactName; }
            set { Set(ref contactName, value); }
        }

        [SqlDbType(Size = 30)]
        string contactTitle;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 30)]
        public string ContactTitle
        {
            get { return contactTitle; }
            set { Set(ref contactTitle, value); }
        }

        [NotNullable]
        AddressEntity address;
        [NotNullValidator]
        public AddressEntity Address
        {
            get { return address; }
            set { Set(ref address, value); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string phone;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone
        {
            get { return phone; }
            set { Set(ref phone, value); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string fax;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Fax
        {
            get { return fax; }
            set { Set(ref fax, value); }
        }

        [SqlDbType(Size = int.MaxValue)]
        string homePage;
        [StringLengthValidator(AllowNulls = true, Min = 3, MultiLine = true)]
        public string HomePage
        {
            get { return homePage; }
            set { Set(ref homePage, value); }
        }

        static Expression<Func<SupplierEntity, string>> ToStringExpression = e => e.CompanyName;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    public static class SupplierOperation
    {
        public static readonly ExecuteSymbol<SupplierEntity> Save = OperationSymbol.Execute<SupplierEntity>();
    }

    [Serializable, EntityKind(EntityKind.String, EntityData.Master)]
    public class CategoryEntity : Entity
    {
        [TranslateField] //Localize categoryName column
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        string categoryName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string CategoryName
        {
            get { return categoryName; }
            set { SetToStr(ref categoryName, value); }
        }

        [TranslateField] //Localize description column
        [NotNullable, SqlDbType(Size = int.MaxValue)]
        string description;
        [StringLengthValidator(AllowNulls = false, Min = 3, MultiLine = true)]
        public string Description
        {
            get { return description; }
            set { Set(ref description, value); }
        }

        EmbeddedFileEntity picture;
        public EmbeddedFileEntity Picture
        {
            get { return picture; }
            set { Set(ref picture, value); }
        }

        static Expression<Func<CategoryEntity, string>> ToStringExpression = e => e.CategoryName;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    public static class CategoryOperation
    {
        public static readonly ExecuteSymbol<CategoryEntity> Save = OperationSymbol.Execute<CategoryEntity>();
    }

    public enum ProductQuery
    {
        Current
    }
}
