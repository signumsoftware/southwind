using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;
using Signum.Page;

namespace Southwind.Test.React;

public class SouthwindTestClass
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

private static readonly Lazy<Task<IBrowser>> DefaultBrowser = new(async () =>
{
    var playwright = await Microsoft.Playwright.Playwright.CreateAsync();

    string? headless = System.Environment.GetEnvironmentVariable("PLAYWRIGHT_HEADLESS");

    if (headless != null && headless.ToLower() == "true")
        return await playwright.Chromium.LaunchAsync(new() { Headless = true });

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

public static async Task BrowseAsync(string username, Func<SouthwindBrowser, Task> action)
{
    var contextOptions = new BrowserNewContextOptions
    {
        ViewportSize = ViewportSize.NoViewport, // Allow start-maximized to work
        Permissions = new[] { "geolocation", "notifications" },
    };

    var browser = await DefaultBrowser.Value;
    var context = await browser.NewContextAsync(contextOptions);

    // Set preferences equivalent to Chrome user profile preferences
    await context.GrantPermissionsAsync(new[] { "clipboard-read", "clipboard-write" });

    var page = await context.NewPageAsync();

    var browserProxy = new SouthwindBrowser(page);

    try
    {
        page.SetDefaultTimeout(10000);
        await browserProxy.LoginAsync(username, username);
        await action(browserProxy);
    }
    finally
    {
        await page.CloseAsync();
        await context.CloseAsync();
    }
}

}

public class SouthwindBrowser : BrowserProxy
{
    public override string Url(string url)
    {
        return SouthwindTestClass.BaseUrl + url;
    }

    public SouthwindBrowser(IPage driver)
        : base(driver)
    {
    }

    public override async Task LoginAsync(string username, string password)
    {
        await base.LoginAsync(username, password);

        string culture = await Page.Locator("#" + "languageSelector").SelectElement().SelectedOption.GetAttributeAsync("value")!;

        Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo(culture);
    }

}
