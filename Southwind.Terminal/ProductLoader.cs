using System.Globalization;
using Signum.Files;
using NW = Southwind.Terminal.NorthwindSchema;
using Southwind.Products;
using Southwind.Customers;

namespace Southwind.Terminal;

internal static class ProductLoader
{
#pragma warning disable 0649
#pragma warning disable CS8618 // Non-nullable field is uninitialized.
    public class SupplierFaxCSV
    {
        public int SupplierID;
        public string Fax;
    }
#pragma warning restore CS8618 // Non-nullable field is uninitialized.
#pragma warning restore 0649

    public static void LoadSuppliers()
    {
        var suppliers = Connector.Override(NW.Northwind.Connector).Using(_ => Database.View<NW.Suppliers>().ToList());

        List<SupplierFaxCSV> faxes = Csv.ReadFile<SupplierFaxCSV>("SupplierFaxes.csv", culture: CultureInfo.GetCultureInfo("es-ES"));

        var faxDic = faxes.ToDictionary(r => r.SupplierID, r => r.Fax);

        suppliers.Select(s => new SupplierEntity
        {
            CompanyName = s.CompanyName,
            ContactName = s.ContactName,
            ContactTitle = s.ContactTitle,
            Phone = s.Phone.Replace(".", " "),
            Fax = faxDic[s.SupplierID].Replace(".", " "),
            Address = new AddressEmbedded
            {
                Address = s.Address,
                City = s.City,
                Region = s.Region,
                PostalCode = s.PostalCode,
                Country = s.Country
            },
        }.SetId(s.SupplierID))
        .BulkInsert(disableIdentity: true);
    }

    public static void LoadCategories()
    {
        var category = Connector.Override(NW.Northwind.Connector).Using(_ => Database.View<NW.Categories>().ToList());

        category.Select(s => new CategoryEntity
        {
            CategoryName = s.CategoryName,
            Description = s.Description,
            Picture = new FileEmbedded { FileName = s.CategoryName + ".jpg", BinaryFile = EmployeeLoader.RemoveOlePrefix(s.Picture.ToArray()) },
        }.SetId(s.CategoryID))
        .BulkInsert(disableIdentity: true);
    }

    public static void LoadProducts()
    {
        var products = Connector.Override(NW.Northwind.Connector).Using(_ => Database.View<NW.Products>().ToList());

        products.Select(s =>
        {
            var p = new ProductEntity
            {
                ProductName = s.ProductName,
                Supplier = Lite.Create<SupplierEntity>(s.SupplierID!.Value),
                Category = Lite.Create<CategoryEntity>(s.CategoryID!.Value),
                QuantityPerUnit = s.QuantityPerUnit,
                UnitPrice = s.UnitPrice!.Value,
                UnitsInStock = s.UnitsInStock!.Value,
                ReorderLevel = s.ReorderLevel!.Value,
                Discontinued = s.Discontinued,
            }.SetId(s.ProductID);

            p.AdditionalInformation.Add(new AdditionalInformationEmbedded { Key = "EAN", Value = "EAN000" + s.ProductID.ToString("0000") });

            if (s.ProductID % 10 == 0)
                p.AdditionalInformation.Add(new AdditionalInformationEmbedded { Key = "Lactosa", Value = "True" });

            if (s.ProductID % 7 == 0)
                p.AdditionalInformation.Add(new AdditionalInformationEmbedded { Key = "Gluten", Value = "True" });

            var mod = s.ProductID % 13;
            p.AdditionalInformation.Add(new AdditionalInformationEmbedded
            {
                Key = "VegMode",
                Value =
                mod < 10 ? "No" :
                mod == 10 ? "Vegetarian" :
                mod == 11 ? "Vegan" :
                "Macrobiotic"
            });

            return p;
        })
        .BulkInsert(disableIdentity: true);
    }
}
