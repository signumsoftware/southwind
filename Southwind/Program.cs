using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace Southwind.React;

public class Program
{
    public static void Main(string[] args)
    {
        BuildWebHost(args).Run();
    }

    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .ConfigureKestrel(a => a.AllowSynchronousIO = true) //JSon.Net needs it for deserialization
            .CaptureStartupErrors(true) // the default
            .UseSetting("detailedErrors", "true")
            .UseStartup<Startup>()
            .Build();
}
