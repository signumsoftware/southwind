using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using Signum.Entities;
using Signum.Utilities;
using Signum.Utilities.ExpressionTrees;

namespace Southwind.Entities
{
    [Serializable, PrimaryKey(typeof(Guid))]
    public abstract class CustomerEntity : Entity
    {
        public AddressEmbedded Address { get; set; }

        [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
        public string Phone { get; set; }

        [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
        public string? Fax { get; set; }

        public static readonly SessionVariable<CustomerEntity> CurrentCustomerVariable = Statics.SessionVariable<CustomerEntity>("Customer");
        public static CustomerEntity Current
        {
            get { return CurrentCustomerVariable.Value; }
            set { CurrentCustomerVariable.Value = value; }
        }
    }


    public enum CustomerQuery
    {
        Customer
    }


    [Serializable, EntityKind(EntityKind.Shared, EntityData.Transactional)]
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
            using (this.Corrupt ? Corruption.AllowScope() : null)
            {
                return base.EntityIntegrityCheck();
            }
        }

        protected override void PreSaving(PreSavingContext ctx)
        {
            base.PreSaving(ctx);
            if (this.Corrupt && base.EntityIntegrityCheck() == null)
            {
                this.Corrupt = false;
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

    [Serializable, EntityKind(EntityKind.Shared, EntityData.Transactional)]
    public class CompanyEntity : CustomerEntity
    {
        [StringLengthValidator(Min = 3, Max = 40)]
        public string CompanyName { get; set; }

        [StringLengthValidator(Min = 3, Max = 30)]
        public string ContactName { get; set; }

        [StringLengthValidator(Min = 3, Max = 30)]
        public string ContactTitle { get; set; }

        [AutoExpressionField]
        public override string ToString() => As.Expression(() => CompanyName);
    }

    [AutoInit]
    public static class CustomerOperation
    {
        public static ExecuteSymbol<CustomerEntity> Save;
    }
}
