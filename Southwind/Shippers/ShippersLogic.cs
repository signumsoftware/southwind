namespace Southwind.Shippers;

public static class ShippersLogic
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
