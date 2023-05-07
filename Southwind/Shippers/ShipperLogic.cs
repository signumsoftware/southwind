using Southwind.Entities.Shippers;

namespace Southwind.Logic.Shippers;

public static class ShipperLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodBase.GetCurrentMethod()))
        {
            sb.Include<ShipperEntity>()
                .WithSave(ShipperOperation.Save)
                .WithQuery(() => a => new
                {
                    Entity = a,
                    a.Id,
                    a.CompanyName,
                    a.Phone
                });
        }
    }
}
