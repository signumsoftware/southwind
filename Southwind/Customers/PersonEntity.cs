namespace Southwind.Customers;

[EntityKind(EntityKind.Shared, EntityData.Transactional), Mixin(typeof(CorruptMixin))]
public class PersonEntity : CustomerEntity
{
    [StringLengthValidator(Min = 3, Max = 40)]
    public string FirstName { get; set; }

    [StringLengthValidator(Min = 3, Max = 40)]
    public string LastName { get; set; }

    [StringLengthValidator(Min = 2, Max = 10), NotNullValidator]
    public string? Title { get; set; }

    [NotNullValidator]
    public DateOnly? DateOfBirth { get; set; }


    public override string ToString()
    {
        return "{0} {1}".FormatWith(FirstName, LastName);
    }

    static PersonEntity()
    {
        Validator.PropertyValidator((PersonEntity p) => p.DateOfBirth).IsApplicableValidator<NotNullValidatorAttribute>(p => Corruption.Strict);
        Validator.PropertyValidator((PersonEntity p) => p.Title).IsApplicableValidator<NotNullValidatorAttribute>(p => Corruption.Strict);
    }
}
