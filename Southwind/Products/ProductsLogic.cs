using System.Collections.Frozen;

namespace Southwind.Products;

public static class ProductsLogic
{
    public static ResetLazy<FrozenDictionary<CategoryEntity, List<ProductEntity>>> ActiveProducts = null!;
    public static ResetLazy<FrozenSet<string>> AdditionalInformationKeys = null!;

    public static void Start(SchemaBuilder sb)
    {
        if (sb.AlreadyDefined(MethodInfo.GetCurrentMethod()))
            return;

        sb.Include<ProductEntity>()
            .WithSave(ProductOperation.Save)
            .WithUniqueIndexMList(a => a.AdditionalInformation, mle => new { mle.Parent, mle.Element.Key })
            .WithExpressionWithParameter(ProductMessage.AdditionalInfo, q => AdditionalInformationKeys.Value, (p, key) => p.AdditionalInformation.SingleOrDefaultEx(ai => ai.Key == key)!.Value)
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

        ActiveProducts = sb.GlobalLazy(() =>
            Database.Query<ProductEntity>()
            .Where(a => !a.Discontinued)
            .Select(p => new { Category = p.Category.Entity, Product = p })
            .GroupToDictionary(a => a.Category, a => a.Product).ToFrozenDictionary(),
            new InvalidateWith(typeof(ProductEntity)));

        AdditionalInformationKeys = sb.GlobalLazy(() => ActiveProducts.Value.SelectMany(a => a.Value).SelectMany(p => p.AdditionalInformation).Select(ai => ai.Key).ToFrozenSet(),
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
