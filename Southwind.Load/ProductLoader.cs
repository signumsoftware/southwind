using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine;
using Southwind.Entities;
using Signum.Utilities;
using Signum.Entities;
using Signum.Services;
using System.Globalization;
using Signum.Entities.Files;
using Southwind.Load.NorthwindSchema;

namespace Southwind.Load
{
    internal static class ProductLoader
    {
#pragma warning disable 0649
        public class SupplierFaxCSV
        {
            public int SupplierID;
            public string Fax;
        }
#pragma warning restore 0649
        public static void LoadSuppliers()
        {
            var suppliers = Connector.Override(Northwind.Connector).Using(_ => Database.View<Suppliers>().ToList());

            List<SupplierFaxCSV> faxes = Csv.ReadFile<SupplierFaxCSV>("SupplierFaxes.csv", culture: CultureInfo.GetCultureInfo("es"));

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
            var category = Connector.Override(Northwind.Connector).Using(_ => Database.View<Categories>().ToList());

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
            var products = Connector.Override(Northwind.Connector).Using(_ => Database.View<Products>().ToList());

            products.Select(s =>
            {
                var p = new ProductEntity
                {
                    ProductName = s.ProductName,
                    Supplier = Lite.Create<SupplierEntity>(s.SupplierID.Value),
                    Category = Lite.Create<CategoryEntity>(s.CategoryID.Value),
                    QuantityPerUnit = s.QuantityPerUnit,
                    UnitPrice = s.UnitPrice.Value,
                    UnitsInStock = s.UnitsInStock.Value,
                    ReorderLevel = s.ReorderLevel.Value,
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
}
