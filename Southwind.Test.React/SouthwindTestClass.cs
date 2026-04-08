using Microsoft.Extensions.Configuration;
using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;

namespace Southwind.Test.React;

public class SouthwindTestClass : SignumPlaywrightTestClass, IAsyncLifetime
{
    static SouthwindTestClass()
    {
        var config = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
             .AddJsonFile("appsettings.json")
             .AddJsonFile($"appsettings.{System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", true)
             .AddUserSecrets(typeof(SouthwindTestClass).Assembly)
             .Build();

        BaseUrl = config["Url"]!;
    }

    public async ValueTask InitializeAsync()
    {
        Administrator.RestoreSnapshotOrDatabase();

        using (var c = new HttpClient())
        {
            AssertClean200(await c.PostAsync(SouthwindTestClass.BaseUrl + "api/cache/invalidateAll", JsonContent.Create(new
            {
                SecretHash = SouthwindEnvironment.BroadcastSecretHash,
            })));
        }
    }

    public ValueTask DisposeAsync()
    {
        return ValueTask.CompletedTask;
    }
    private static readonly Lazy<Task<IBrowser>> DefaultBrowser = new(async () =>
    {
        var playwright = await Microsoft.Playwright.Playwright.CreateAsync();

        string? mode = GetPlaywrightMode();

        return await GetBrowser(playwright, mode);
    });


    public async Task BrowseAsync(string username, Func<SouthwindBrowser, Task> action)
    {
        var browser = await DefaultBrowser.Value;

        var page = await GetPageAsync(browser, []);

        var browserProxy = new SouthwindBrowser(page);

        try
        {
            page.SetDefaultTimeout(10000);
            await browserProxy.LoginAsync(username, username);
            CultureInfo.CurrentCulture = CultureInfo.CurrentUICulture = await browserProxy.GetCultureFromLoginDropdownAsync();
            await action(browserProxy);
        }
        finally
        {
            if (!BrowserProxy.DebugMode)
                await page.CloseAsync();
        }
    }

    
}
