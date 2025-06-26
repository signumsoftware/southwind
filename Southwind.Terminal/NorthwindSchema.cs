using Microsoft.Extensions.Configuration;
using Signum.Engine.Maps;

namespace Southwind.Terminal.NorthwindSchema;

public static class Northwind
{
    static Connector? connector;
    public static Connector Connector
    {
        get
        {
            if (connector != null)
                return connector;

            var northwindConnectionString = Program.Configuration.GetConnectionString("NorthwindConnectionString")!;
            return connector = new SqlServerConnector(northwindConnectionString, new SchemaBuilder().Schema, SqlServerVersion.SqlServer2012);
        }
    }

    
}



#pragma warning disable CS8618 // Non-nullable field is uninitialized.
[TableName("dbo.Categories")]
public class Categories : IView
{
    [ViewPrimaryKey]
    public int CategoryID;
    public string CategoryName;
    public string? Description;
    public byte[]? Picture;
}


[TableName("dbo.Suppliers")]
public class Suppliers : IView
{
    [ViewPrimaryKey]
    public int SupplierID;
    public string CompanyName;
    public string? ContactName;
    public string? ContactTitle;
    public string? Address;
    public string? City;
    public string? Region;
    public string? PostalCode;
    public string? Country;
    public string? Phone;
    public string? Fax;
    public string? HomePage;
}


[TableName("dbo.Customers")]
public class Customers : IView
{
    [ViewPrimaryKey]
    public string CustomerID;
    public string CompanyName;
    public string? ContactName;
    public string? ContactTitle;
    public string? Address;
    public string? City;
    public string? Region;
    public string? PostalCode;
    public string? Country;
    public string? Phone;
    public string? Fax;
}


[TableName("dbo.Employees")]
public class Employees : IView
{
    [ViewPrimaryKey]
    public int EmployeeID;
    public string LastName;
    public string FirstName;
    public string? Title;
    public string? TitleOfCourtesy;
    public DateTime? BirthDate;
    public DateTime? HireDate;
    public string? Address;
    public string? City;
    public string? Region;
    public string? PostalCode;
    public string? Country;
    public string? HomePhone;
    public string? Extension;
    public byte[]? Photo;
    public string? Notes;
    public int? ReportsTo;
    public string? PhotoPath;
}


[TableName("dbo.EmployeeTerritories")]
public class EmployeeTerritories : IView
{
    [ViewPrimaryKey]
    public int EmployeeID;
    [ViewPrimaryKey]
    public string TerritoryID;
}


[TableName("dbo.Orders")]
public class Orders : IView
{
    [ViewPrimaryKey]
    public int OrderID;
    public string? CustomerID;
    public int? EmployeeID;
    public DateTime? OrderDate;
    public DateTime? RequiredDate;
    public DateTime? ShippedDate;
    public int? ShipVia;
    public decimal? Freight;
    public string? ShipName;
    public string? ShipAddress;
    public string? ShipCity;
    public string? ShipRegion;
    public string? ShipPostalCode;
    public string? ShipCountry;
}


[TableName("dbo.[Order Details]")]
public class OrderDetails : IView
{
    [ViewPrimaryKey]
    public int OrderID;
    [ViewPrimaryKey]
    public int ProductID;
    public decimal UnitPrice;
    public short Quantity;
    public float Discount;
}


[TableName("dbo.Products")]
public class Products : IView
{
    [ViewPrimaryKey]
    public int ProductID;
    public string ProductName;
    public int? SupplierID;
    public int? CategoryID;
    public string? QuantityPerUnit;
    public decimal? UnitPrice;
    public short? UnitsInStock;
    public short? UnitsOnOrder;
    public short? ReorderLevel;
    public bool Discontinued;
}


[TableName("dbo.Region")]
public class Region : IView
{
    [ViewPrimaryKey]
    public int RegionID;
    public string RegionDescription;
}


[TableName("dbo.Shippers")]
public class Shippers : IView
{
    [ViewPrimaryKey]
    public int ShipperID;
    public string CompanyName;
    public string? Phone;
}


[TableName("dbo.Territories")]
public class Territories : IView
{
    [ViewPrimaryKey]
    public string TerritoryID;
    public string TerritoryDescription;
    public int RegionID;
}


