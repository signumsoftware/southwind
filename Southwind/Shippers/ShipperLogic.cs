using Southwind.Shippers;

namespace Southwind.Logic;

public static class ShipperLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodInfo.GetCurrentMethod()))
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
