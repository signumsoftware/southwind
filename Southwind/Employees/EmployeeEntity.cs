using Signum.Entities;
using Signum.Files;
using Southwind.Customers;

namespace Southwind.Employees;

[EntityKind(EntityKind.Main, EntityData.Master)]
public class EmployeeEntity : Entity
{
    [StringLengthValidator(Min = 3, Max = 20)]
    public string LastName { get; set; }

    [StringLengthValidator(Min = 3, Max = 10)]
    public string FirstName { get; set; }

    [StringLengthValidator(Min = 3, Max = 30)]
    public string? Title { get; set; }

    [StringLengthValidator(Min = 3, Max = 25)]
    public string? TitleOfCourtesy { get; set; }

    public DateOnly? BirthDate { get; set; }

    public DateOnly? HireDate { get; set; }

    public AddressEmbedded Address { get; set; }

    [StringLengthValidator(Min = 3, Max = 25), TelephoneValidator]
    public string? HomePhone { get; set; }

    [StringLengthValidator(Min = 3, Max = 4), TelephoneValidator]
    public string? Extension { get; set; }

    public Lite<FileEntity>? Photo { get; set; } //1
  
    [StringLengthValidator(Min = 3, MultiLine = true)]
    public string? Notes { get; set; }

    public Lite<EmployeeEntity>? ReportsTo { get; set; }

    [StringLengthValidator(Min = 3, Max = 255), URLValidator]
    public string? PhotoPath { get; set; }

    [NoRepeatValidator, NoRepeatValidator]
    public MList<TerritoryEntity> Territories { get; set; } = new MList<TerritoryEntity>();

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => $"{FirstName} {LastName}");

    public static Lite<EmployeeEntity>? Current
    {
        get { return (Lite<EmployeeEntity>?)UserHolder.Current?.GetClaim("Employee"); } //get { return null; }
    } //Current
}

[AutoInit]
public static class EmployeeOperation
{
    public static ExecuteSymbol<EmployeeEntity> Save;
}


public enum EmployeeQuery
{
    EmployeesByTerritory
}


[AllowUnauthenticated]
public class EmployeeLiteModel : ModelEntity
{
    [StringLengthValidator(Min = 3, Max = 20)]
    public string LastName { get; set; }

    [StringLengthValidator(Min = 3, Max = 10)]
    public string FirstName { get; set; }

    public Lite<FileEntity>? Photo { get; set; } //2

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => $"{FirstName} {LastName}");
}

