namespace Southwind.Customers;

[EntityKind(EntityKind.Shared, EntityData.Transactional)]
public class PersonEntity : CustomerEntity
{
    [StringLengthValidator(Min = 3, Max = 40)]
    public string FirstName { get; set; }

    [StringLengthValidator(Min = 3, Max = 40)]
    public string LastName { get; set; }

    [StringLengthValidator(Min = 3, Max = 10)]
    public string? Title { get; set; }

    [DateTimePrecisionValidator(DateTimePrecision.Days)]
    public DateTime? DateOfBirth { get; set; }

    public bool Corrupt { get; set; }

    public override Dictionary<Guid, IntegrityCheck>? EntityIntegrityCheck()
    {
        using (Corrupt ? Corruption.AllowScope() : null)
        {
            return base.EntityIntegrityCheck();
        }
    }

    protected override void PreSaving(PreSavingContext ctx)
    {
        base.PreSaving(ctx);
        if (Corrupt && base.EntityIntegrityCheck() == null)
        {
            Corrupt = false;
        }
    }

    public override string ToString()
    {
        return "{0} {1}".FormatWith(FirstName, LastName);
    }

    static PersonEntity()
    {
        Validator.PropertyValidator((PersonEntity p) => p.DateOfBirth).IsApplicableValidator<DateTimePrecisionValidatorAttribute>(p => Corruption.Strict);
        Validator.PropertyValidator((PersonEntity p) => p.Title).IsApplicableValidator<StringLengthValidatorAttribute>(p => Corruption.Strict);
    }
}
