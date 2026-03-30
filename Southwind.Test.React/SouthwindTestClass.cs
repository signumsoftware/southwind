using Microsoft.Extensions.Configuration;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;

namespace Southwind.Test.React;

public class SouthwindTestClass :IAsyncLifetime
{
    public static string BaseUrl { get; private set; }

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
        PlaywrightExtensions.ResetCaptureModalIndex();

        Administrator.RestoreSnapshotOrDatabase();

        using (var c = new HttpClient())
        {
            await c.PostAsync(SouthwindTestClass.BaseUrl + "api/cache/invalidateAll", JsonContent.Create(new
            {
                SecretHash = SouthwindEnvironment.BroadcastSecretHash,
            }));
        }
    }

    public ValueTask DisposeAsync()
    {
        return ValueTask.CompletedTask;
    }

    const int DebugChromePort = 9222;

    private static readonly Lazy<Task<IBrowser>> DefaultBrowser = new(async () =>
    {
        var playwright = await Microsoft.Playwright.Playwright.CreateAsync();

        string? mode = System.Environment.GetEnvironmentVariable("PLAYWRIGHT_MODE") ??
                       ReadFile(Path.Combine(Directory.GetCurrentDirectory(), @"..\..\..\PLAYWRIGHT_MODE.txt"));

        if (mode != null && mode.ToLower() == "headless")
            return await playwright.Chromium.LaunchAsync(new() { Headless = true });

        if (mode != null && mode.ToLower() == "debug")
        {
            BrowserProxy.DebugMode = true;
            var userDataDir = Path.Combine(Path.GetTempPath(), "playwright-debug-chrome");
            return await BrowserProxy.ConnectDebugChromeAsync(playwright, DebugChromePort, userDataDir);
        }

        // Configure browser launch options (equivalent to ChromeOptions)
        var launchOptions = new BrowserTypeLaunchOptions
        {
            Headless = false,
            Args = new[]
            {
                "--start-maximized",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-popup-blocking",
            },
        };

        return await playwright.Chromium.LaunchAsync(launchOptions);
    });

    private static string? ReadFile(string v)
    {
        if (File.Exists(v))
            return File.ReadAllLines(v).FirstOrDefault();
        return null;
    }

    public static async Task BrowseAsync(string username, Func<SouthwindBrowser, Task> action)
    {
        var browser = await DefaultBrowser.Value;

        IBrowserContext context;
        if (BrowserProxy.DebugMode)
        {
            // Reuse the default context of the CDP-launched Chrome window so the
            // new page opens as a tab there instead of a separate incognito window.
            context = browser.Contexts[0];
            await context.GrantPermissionsAsync(new[] { "geolocation", "notifications", "clipboard-read", "clipboard-write" });
        }
        else
        {
            context = await browser.NewContextAsync(new BrowserNewContextOptions
            {
                ViewportSize = ViewportSize.NoViewport, // Allow start-maximized to work
                Permissions = new[] { "geolocation", "notifications" },
            });
            await context.GrantPermissionsAsync(new[] { "clipboard-read", "clipboard-write" });
        }

        var page = await context.NewPageAsync();

        var browserProxy = new SouthwindBrowser(page);

        bool testPassed = false;
        try
        {
            page.SetDefaultTimeout(10000);
            await browserProxy.LoginAsync(username, username);
            await action(browserProxy);
            testPassed = true;
        }
        finally
        {
            if (testPassed || !BrowserProxy.DebugMode)
            {
                await page.CloseAsync();
                await context.CloseAsync();
            }
            else
            {
                Console.WriteLine("[PLAYWRIGHT DEBUG MODE] Test failed — keeping browser open for inspection.");
            }
        }
    }

    
}
