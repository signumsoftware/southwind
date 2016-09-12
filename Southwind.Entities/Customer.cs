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
        [NotNullable]
        [NotNullValidator]
        public AddressEntity Address { get; set; }

        [NotNullable, SqlDbType(Size = 24)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone { get; set; }

        [SqlDbType(Size = 24)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 24), TelephoneValidator]
        public string Fax { get; set; }

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
        [NotNullable, SqlDbType(Size = 40)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string FirstName { get; set; }

        [NotNullable, SqlDbType(Size = 40)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string LastName { get; set; }

        [SqlDbType(Size = 10)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 10)]
        public string Title { get; set; }

        [DateTimePrecissionValidator(DateTimePrecision.Days)]
        public DateTime? DateOfBirth { get; set; }

        public bool Corrupt { get; set; }

        public override Dictionary<Guid, Dictionary<string, string>> EntityIntegrityCheck()
        {
            using (this.Corrupt ? Corruption.AllowScope() : null)
            {
                return base.EntityIntegrityCheck();
            }
        }

        protected override void PreSaving(ref bool graphModified)
        {
            base.PreSaving(ref graphModified);
            if (this.Corrupt && base.EntityIntegrityCheck() == null)
            {
                this.Corrupt = false;
            }
        }

        protected override void PostRetrieving()
        {
            base.PostRetrieving();
        }

        public override string ToString()
        {
            return "{0} {1}".FormatWith(FirstName, LastName);
        }

        static PersonEntity()
        {
            Validator.PropertyValidator((PersonEntity p) => p.DateOfBirth).IsApplicableValidator<DateTimePrecissionValidatorAttribute>(p => Corruption.Strict);
            Validator.PropertyValidator((PersonEntity p) => p.Title).IsApplicableValidator<StringLengthValidatorAttribute>(p => Corruption.Strict);
        }
    }

    [Serializable, EntityKind(EntityKind.Shared, EntityData.Transactional)]
    public class CompanyEntity : CustomerEntity
    {
        [SqlDbType(Size = 40)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 40)]
        public string CompanyName { get; set; }

        [NotNullable, SqlDbType(Size = 30)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 30)]
        public string ContactName { get; set; }

        [NotNullable, SqlDbType(Size = 30)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 30)]
        public string ContactTitle { get; set; }

        static Expression<Func<CompanyEntity, string>> ToStringExpression = e => e.CompanyName;
        [ExpressionField]
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class CustomerOperation
    {
        public static ExecuteSymbol<CustomerEntity> Save;
    }
}
