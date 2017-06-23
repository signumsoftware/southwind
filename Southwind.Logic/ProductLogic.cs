using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine.Maps;
using Signum.Engine.DynamicQuery;
using System.Reflection;
using Southwind.Entities;
using Signum.Engine;
using Signum.Utilities;
using Signum.Entities;
using Signum.Engine.Operations;

namespace Southwind.Logic
{
    public static class ProductLogic
    {
        public static ResetLazy<Dictionary<CategoryEntity, List<ProductEntity>>> ActiveProducts;

        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<ProductEntity>()
                    .WithSave(ProductOperation.Save)
                    .WithQuery(dqm, () => p => new
                    {
                        Entity = p,
                        p.Id,
                        p.ProductName,
                        p.Supplier,
                        p.Category,
                        p.QuantityPerUnit,
                        p.UnitPrice,
                        p.UnitsInStock,
                        p.Discontinued
                    });

                ActiveProducts = sb.GlobalLazy(() =>
                    Database.Query<ProductEntity>()
                    .Where(a => !a.Discontinued)
                    .Select(p => new { Category = p.Category.Entity, Product = p })
                    .GroupToDictionary(a => a.Category, a => a.Product),
                    new InvalidateWith(typeof(ProductEntity)));
                
                dqm.RegisterQuery(ProductQuery.CurrentProducts, () =>
                    from p in Database.Query<ProductEntity>()
                    where !p.Discontinued
                    select new
                    {
                        Entity = p,
                        p.Id,
                        p.ProductName,
                        p.Supplier,
                        p.Category,
                        p.QuantityPerUnit,
                        p.UnitPrice,
                        p.UnitsInStock,
                    });

                sb.Include<SupplierEntity>()
                    .WithSave(SupplierOperation.Save)
                    .WithQuery(dqm, () => s => new
                    {
                        Entity = s,
                        s.Id,
                        s.CompanyName,
                        s.ContactName,
                        s.Phone,
                        s.Fax,
                        s.HomePage,
                        s.Address
                    });

                sb.Include<CategoryEntity>()
                    .WithSave(CategoryOperation.Save)
                    .WithQuery(dqm, () => s => new
                    {
                        Entity = s,
                        s.Id,
                        s.CategoryName,
                        s.Description,
                        s.Picture
                    });
            }
        }
    }
}
