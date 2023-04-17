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
            return connector = new SqlServerConnector(northwindConnectionString, new SchemaBuilder(false).Schema, SqlServerVersion.SqlServer2012);
        }
    }
}

#pragma warning disable CS8618 // Non-nullable field is uninitialized.
public class Categories : IView
{
    [ViewPrimaryKey]
    public int CategoryID;
    public string CategoryName;
    public string Description;
    public byte[] Picture;
}

public class Suppliers : IView
{
    [ViewPrimaryKey]
    public int SupplierID;
    public string CompanyName;
    public string ContactName;
    public string ContactTitle;
    public string Address;
    public string City;
    public string Region;
    public string PostalCode;
    public string Country;
    public string Phone;
    public string Fax;
    public string HomePage;
}

public class Customers : IView
{
    [ViewPrimaryKey]
    public string CustomerID;
    public string CompanyName;
    public string ContactName;
    public string ContactTitle;
    public string Address;
    public string City;
    public string Region;
    public string PostalCode;
    public string Country;
    public string Phone;
    public string Fax;
}

public class Employees : IView
{
    [ViewPrimaryKey]
    public int EmployeeID;
    public string LastName;
    public string FirstName;
    public string Title;
    public string TitleOfCourtesy;
    public DateTime? BirthDate;
    public DateTime? HireDate;
    public string Address;
    public string City;
    public string Region;
    public string PostalCode;
    public string Country;
    public string HomePhone;
    public string Extension;
    public byte[] Photo;
    public string Notes;
    public int? ReportsTo;
    public string PhotoPath;
}

public class EmployeeTerritories : IView
{
    [ViewPrimaryKey]
    public int EmployeeID;
    public string TerritoryID;
}

public class Orders : IView
{
    [ViewPrimaryKey]
    public int OrderID;
    public string CustomerID;
    public int? EmployeeID;
    public DateTime? OrderDate;
    public DateTime? RequiredDate;
    public DateTime? ShippedDate;
    public int? ShipVia;
    public decimal? Freight;
    public string ShipName;
    public string ShipAddress;
    public string ShipCity;
    public string ShipRegion;
    public string ShipPostalCode;
    public string ShipCountry;
}

[TableName("Order Details")]
public class OrderDetails : IView
{
    [ViewPrimaryKey]
    public int OrderID;
    public int ProductID;
    public decimal UnitPrice;
    public int Quantity;
    public float Discount;
}

public class Products : IView
{
    [ViewPrimaryKey]
    public int ProductID;
    public string ProductName;

    public int? SupplierID;
    public int? CategoryID;
    public string QuantityPerUnit;
    public decimal? UnitPrice;
    public short? UnitsInStock;
    public short? ReorderLevel;
    public bool Discontinued;
}

public class Region : IView
{
    [ViewPrimaryKey]
    public int RegionID;
    public string RegionDescription;

}

public class Shippers : IView
{
    [ViewPrimaryKey]
    public int ShipperID;
    public string CompanyName;
    public string Phone;
}

public class Territories : IView
{
    [ViewPrimaryKey]
    public string TerritoryID;
    public string TerritoryDescription;
    public int RegionID;
}
