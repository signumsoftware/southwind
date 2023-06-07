namespace Southwind.Globals;

public static class GlobalsLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodBase.GetCurrentMethod()))
        {
            sb.Include<ApplicationConfigurationEntity>()
            .WithSave(ApplicationConfigurationOperation.Save)
            .WithQuery(() => s => new
            {
                Entity = s,
                s.Id,
                s.Environment,
                s.Email.SendEmails,
                s.Email.OverrideEmailAddress,
                s.Email.DefaultCulture,
                s.Email.UrlLeft
            });

        	Starter.Configuration = sb.GlobalLazy<ApplicationConfigurationEntity>(
            () => Database.Query<ApplicationConfigurationEntity>().Single(a => a.DatabaseName == Connector.Current.DatabaseName()),
            new InvalidateWith(typeof(ApplicationConfigurationEntity)));
        }
    }
}            
