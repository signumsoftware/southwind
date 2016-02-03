using Signum.Engine;
using Signum.Entities;
using Signum.Entities.Reflection;
using Southwind.Entities;
using Southwind.Logic;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace Southwind.React.ApiControllers
{
    public class ValuesController : ApiController
    {

        [Route("api/catalog"), HttpGet]
        public List<CategoryWithProducts> Catalog()
        {
            return ProductLogic.ActiveProducts.Value.Select(a => new CategoryWithProducts
            {
                category = a.Key,
                products = a.Value
            }).ToList();
        }

        public class CategoryWithProducts
        {
            public CategoryEntity category;
            public List<ProductEntity> products;
        }

        // GET api/values
        public IEnumerable<Lite<OrderEntity>> Get()
        {
            return Database.Query<OrderEntity>().Select(a => a.ToLite()).Take(10);
        }

        // GET api/values/5
        public OrderEntity Get(string id)
        {
            var pk = PrimaryKey.Parse(id, typeof(OrderEntity));
            return Database.Query<OrderEntity>().Single(a => a.Id == pk);
        }

        // POST api/values
        [InvalidModelStateFilter]
        public void Post(Box value)
        {
            if (GraphExplorer.HasChanges(value.Content))
                throw new InvalidOperationException();
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }



    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class InvalidModelStateFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (!actionContext.ModelState.IsValid)
            {
                actionContext.Response = actionContext.Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest, actionContext.ModelState);
            }
        }
    }

    public class Box
    {
        [Required]
        public OrderEntity Content { get; set; }
    }
}