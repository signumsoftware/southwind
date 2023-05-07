using Southwind.Customers;
using Southwind.Orders;

namespace Southwind.Customers;

public static class CustomerLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodBase.GetCurrentMethod()))
        {
            sb.Settings.AssertImplementedBy((OrderEntity o) => o.Customer, typeof(CompanyEntity));
            sb.Settings.AssertImplementedBy((OrderEntity o) => o.Customer, typeof(PersonEntity));

            sb.Include<PersonEntity>()
                .WithSave(CustomerOperation.Save)
                .WithQuery(() => r => new
                {
                    Entity = r,
                    r.Id,
                    r.FirstName,
                    r.LastName,
                    r.DateOfBirth,
                    r.Phone,
                    r.Fax,
                    r.Address,
                });

            sb.Include<CompanyEntity>()
                .WithSave(CustomerOperation.Save)
                .WithQuery(() => r => new
                {
                    Entity = r,
                    r.Id,
                    r.CompanyName,
                    r.ContactName,
                    r.ContactTitle,
                    r.Phone,
                    r.Fax,
                    r.Address,
                });

            QueryLogic.Queries.Register(CustomerQuery.Customer, () => DynamicQueryCore.Manual(async (request, descriptions, token) =>
            {
                var persons = Database.Query<PersonEntity>().Select(p => new
                {
                    Entity = p.ToLite<CustomerEntity>(),
                    Id = "P " + p.Id,
                    Name = p.FirstName + " " + p.LastName,
                    p.Address,
                    p.Phone,
                    p.Fax
                }).ToDQueryable(descriptions).AllQueryOperationsAsync(request, token);

                var companies = Database.Query<CompanyEntity>().Select(p => new
                {
                    Entity = p.ToLite<CustomerEntity>(),
                    Id = "C " + p.Id,
                    Name = p.CompanyName,
                    p.Address,
                    p.Phone,
                    p.Fax
                }).ToDQueryable(descriptions).AllQueryOperationsAsync(request, token);

                return (await persons).Concat(await companies)
                    .OrderBy(request.Orders)
                    .TryPaginate(request.Pagination);

            })
            .ColumnProperyRoutes(a => a.Id,
                PropertyRoute.Construct((PersonEntity comp) => comp.Id),
                PropertyRoute.Construct((CompanyEntity p) => p.Id))
            .ColumnProperyRoutes(a => a.Name,
                PropertyRoute.Construct((PersonEntity comp) => comp.FirstName),
                PropertyRoute.Construct((PersonEntity comp) => comp.LastName),
                PropertyRoute.Construct((CompanyEntity p) => p.CompanyName))
            .ColumnProperyRoutes(a => a.Address,
                PropertyRoute.Construct((PersonEntity comp) => comp.Address),
                PropertyRoute.Construct((PersonEntity comp) => comp.Address))
            .ColumnProperyRoutes(a => a.Phone,
                PropertyRoute.Construct((PersonEntity comp) => comp.Phone),
                PropertyRoute.Construct((CompanyEntity p) => p.Phone))
            .ColumnProperyRoutes(a => a.Fax,
                PropertyRoute.Construct((PersonEntity comp) => comp.Fax),
                PropertyRoute.Construct((CompanyEntity p) => p.Fax))
            , entityImplementations: Implementations.By(typeof(PersonEntity), typeof(CompanyEntity)));

            QueryLogic.Expressions.Register((CustomerEntity c) => c.Address).ForcePropertyRoute = PropertyRoute.Construct((PersonEntity p) => p.Address);
            QueryLogic.Expressions.Register((CustomerEntity c) => c.Phone).ForcePropertyRoute = PropertyRoute.Construct((PersonEntity p) => p.Address);
            QueryLogic.Expressions.Register((CustomerEntity c) => c.Fax).ForcePropertyRoute = PropertyRoute.Construct((PersonEntity p) => p.Address);

        }
    }
}
