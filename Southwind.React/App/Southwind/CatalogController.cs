using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signum.Engine;
using Signum.Entities;
using Signum.Entities.Reflection;
using Signum.React.ApiControllers;
using Signum.React.Filters;
using Southwind.Entities;
using Southwind.Logic;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;

namespace Southwind.React.ApiControllers
{
    public class CatalogController : ControllerBase
    {
        [HttpGet("api/catalog"), SignumAllowAnonymous]
        public List<CategoryWithProducts> Catalog()
        {
            return ProductLogic.ActiveProducts.Value.Select(a => new CategoryWithProducts
            {
                category = a.Key,
                products = a.Value
            }).ToList();
        }

#pragma warning disable CS8618 // Non-nullable field is uninitialized.
        public class CategoryWithProducts
        {
            public CategoryEntity category;
            public List<ProductEntity> products;
        }
#pragma warning restore CS8618 // Non-nullable field is uninitialized.
    }
}
