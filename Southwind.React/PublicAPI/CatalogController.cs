using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Signum.Engine;
using Signum.React.RestLog;
using Southwind.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Southwind.React.Controllers
{
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
    }

    public class CategoryDTO
    {
        public int Id { get; internal set; }
        public string Name { get; internal set; }
        public string Description { get; internal set; }
    }
}
