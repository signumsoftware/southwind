using Southwind.Products;

namespace Southwind.Products;

public static class ProductLogic
{
    public static ResetLazy<Dictionary<CategoryEntity, List<ProductEntity>>> ActiveProducts = null!;
    public static ResetLazy<HashSet<string>> AdditionalInformationKeys = null!;

    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodBase.GetCurrentMethod()))
        {
            sb.Include<ProductEntity>()
                .WithSave(ProductOperation.Save)
                .WithQuery(() => p => new
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

            sb.AddUniqueIndexMList((ProductEntity pe) => pe.AdditionalInformation, mle => new { mle.Parent, mle.Element.Key });
            QueryLogic.Expressions.RegisterWithParameter((ProductEntity p, string key) => p.AdditionalInformation.SingleOrDefaultEx(ai => ai.Key == key)!.Value, getKeys: t => AdditionalInformationKeys.Value);

            ActiveProducts = sb.GlobalLazy(() =>
                Database.Query<ProductEntity>()
                .Where(a => !a.Discontinued)
                .Select(p => new { Category = p.Category.Entity, Product = p })
                .GroupToDictionary(a => a.Category!, a => a.Product!), /*CSBUG*/
                new InvalidateWith(typeof(ProductEntity)));

            AdditionalInformationKeys = sb.GlobalLazy(() => ActiveProducts.Value.SelectMany(a => a.Value).SelectMany(p => p.AdditionalInformation).Select(ai => ai.Key).ToHashSet(),
                new InvalidateWith(typeof(ProductEntity)));

            QueryLogic.Queries.Register(ProductQuery.CurrentProducts, () =>
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
                .WithQuery(() => s => new
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
                .WithQuery(() => s => new
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
