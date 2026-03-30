namespace Southwind.Test.React;

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


}
