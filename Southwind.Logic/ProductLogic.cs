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
                sb.Include<ProductEntity>();

                ActiveProducts = sb.GlobalLazy(() =>
                    Database.Query<ProductEntity>()
                    .Where(a => !a.Discontinued)
                    .Select(p => new { Category = p.Category.Entity, Product = p })
                    .GroupToDictionary(a => a.Category, a => a.Product),
                    new InvalidateWith(typeof(ProductEntity)));

                dqm.RegisterQuery(typeof(ProductEntity), () =>
                    from p in Database.Query<ProductEntity>()
                    select new
                    {
                        Entity = p.ToLite(),
                        p.Id,
                        p.ProductName,
                        p.Supplier,
                        p.Category,
                        p.QuantityPerUnit,
                        p.UnitPrice,
                        p.UnitsInStock,
                        p.Discontinued
                    });

                dqm.RegisterQuery(ProductQuery.Current, () =>
                    from p in Database.Query<ProductEntity>()
                    where !p.Discontinued
                    select new
                    {
                        Entity = p.ToLite(),
                        p.Id,
                        p.ProductName,
                        p.Supplier,
                        p.Category,
                        p.QuantityPerUnit,
                        p.UnitPrice,
                        p.UnitsInStock,
                    });

                dqm.RegisterQuery(typeof(SupplierEntity), () =>
                    from s in Database.Query<SupplierEntity>()
                    select new
                    {
                        Entity = s.ToLite(),
                        s.Id,
                        s.CompanyName,
                        s.ContactName,
                        s.Phone,
                        s.Fax,
                        s.HomePage,
                        s.Address
                    });

                dqm.RegisterQuery(typeof(CategoryEntity), () =>
                    from s in Database.Query<CategoryEntity>()
                    select new
                    {
                        Entity = s.ToLite(),
                        s.Id,
                        s.CategoryName,
                        s.Description,
                        s.Picture
                    });



                new Graph<ProductEntity>.Execute(ProductOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();

                new Graph<SupplierEntity>.Execute(SupplierOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();

                new Graph<CategoryEntity>.Execute(CategoryOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();
            }
        }
    }
}
