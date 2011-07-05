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

namespace Southwind.Load
{
    internal static class ProductLoader
    {
        public class SupplierFaxCSV
        {
            public int SupplierID;
            public string Fax; 
        }

        public static void LoadSuppliers()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                List<SupplierFaxCSV> faxes = Csv.ReadFile<SupplierFaxCSV>("SupplierFaxes.csv", 
                    Encoding.GetEncoding(1252), CultureInfo.GetCultureInfo("es"), true);

                var faxDic = faxes.ToDictionary(r => r.SupplierID, r => r.Fax); 

                Administrator.SaveListDisableIdentity(db.Suppliers.Select(s =>
                    Administrator.SetId(s.SupplierID, new SupplierDN
                    {
                        CompanyName = s.CompanyName,
                        ContactName = s.ContactName,
                        ContactTitle = s.ContactTitle,
                        Phone = s.Phone.Replace(".", " "),
                        Fax = faxDic[s.SupplierID].Replace(".", " "),
                        Address = new AddressDN
                        {
                            Address = s.Address,
                            City = s.City,
                            Region = s.Region,
                            PostalCode = s.PostalCode,
                            Country = s.Country
                        },
                    })));
            }
        }

        public static void LoadCategories()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                Administrator.SaveListDisableIdentity(db.Categories.Select(s =>
                    Administrator.SetId(s.CategoryID, new CategoryDN
                    {
                        CategoryName = s.CategoryName,
                        Description = s.Description,
                        Picture = s.Picture.ToArray(),
                    })));
            }
        }

        public static void LoadProducts()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                Administrator.SaveListDisableIdentity(db.Products.Select(s =>
                    Administrator.SetId(s.ProductID, new ProductDN
                    {
                        ProductName = s.ProductName,
                        Supplier = new Lite<SupplierDN>(s.SupplierID.Value),
                        Category = new Lite<CategoryDN>(s.CategoryID.Value),
                        QuantityPerUnit = s.QuantityPerUnit,
                        UnitPrice = s.UnitPrice.Value,
                        UnitsInStock = s.UnitsInStock.Value,
                        ReorderLevel = s.ReorderLevel.Value,
                        Discontinued = s.Discontinued,
                    })));
            }
        }
    }
}
