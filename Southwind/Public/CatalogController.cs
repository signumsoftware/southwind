using Microsoft.AspNetCore.Mvc;
using Signum.API.Filters;
using Signum.Rest;
using Signum.Translation.Instances;
using Southwind.Logic;
using Southwind.Products;

namespace Southwind.React.Controllers;

[IncludeInDocumentation, RestLogFilter(allowReplay: true)]
public class CatalogController : Controller
{
    [HttpGet("api/categories")]
    public List<CategoryDTO> GetCategories()
    {
        return Database.Query<CategoryEntity>().Select(a => new CategoryDTO
        {
            Id = (int)a.Id,
            Name = a.CategoryName,
            Description = a.Description
        }).ToList();
    }

    static PropertyRoute prCategoryName = PropertyRoute.Construct((CategoryEntity a) => a.CategoryName);
    static PropertyRoute prDescription = PropertyRoute.Construct((CategoryEntity a) => a.Description);

    [HttpGet("api/catalog"), SignumAllowAnonymous]
    public List<CategoryWithProducts> Catalog()
    {
        return ProductLogic.ActiveProducts.Value.Select(a => new CategoryWithProducts
        {
            Category = a.Key.ToLite(),
            Picture = a.Key.Picture?.BinaryFile,
            LocCategoryName = PropertyRouteTranslationLogic.TranslatedField(a.Key.ToLite(), prCategoryName, null, a.Key.CategoryName),
            LocDescription = PropertyRouteTranslationLogic.TranslatedField(a.Key.ToLite(), prDescription, null, a.Key.Description),
            Products = a.Value
        }).ToList();
    }
}

#pragma warning disable CS8618 // Non-nullable field is uninitialized.
public class CategoryDTO
{
    public int Id { get; internal set; }
    public string Name { get; internal set; }
    public string Description { get; internal set; }
}

public class CategoryWithProducts
{
    public Lite<CategoryEntity> Category;
    public byte[]? Picture;
    public string LocCategoryName;
    public string LocDescription;
    public List<ProductEntity> Products;
}
#pragma warning restore CS8618 // Non-nullable field is uninitialized.
