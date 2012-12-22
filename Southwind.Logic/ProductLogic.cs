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
        public static void Start(SchemaBuilder sb, DynamicQueryManager dqm)
        {
            if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                sb.Include<ProductDN>();

                dqm[typeof(ProductDN)] = (from p in Database.Query<ProductDN>()
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
                                          }).ToDynamic();

                dqm[ProductQueries.Current] = (from p in Database.Query<ProductDN>()
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
                                               }).ToDynamic();

                dqm[typeof(SupplierDN)] = (from s in Database.Query<SupplierDN>()
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
                                           }).ToDynamic();

                dqm[typeof(CategoryDN)] = (from s in Database.Query<CategoryDN>()
                                           select new
                                           {
                                               Entity = s.ToLite(),
                                               s.Id,
                                               s.CategoryName,
                                               s.Description,
                                           }).ToDynamic();

                

                new BasicExecute<ProductDN>(ProductOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();

                new BasicExecute<SupplierDN>(SupplierOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();

                new BasicExecute<CategoryDN>(CategoryOperation.Save)
                {
                    AllowsNew = true,
                    Lite = false,
                    Execute = (e, _) => { }
                }.Register();
            }
        }
    }
}
