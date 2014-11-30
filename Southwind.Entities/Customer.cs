using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using Signum.Entities;
using Signum.Utilities;

namespace Southwind.Entities
{
    [Serializable, PrimaryKey(typeof(Guid))]
    public abstract class CustomerEntity : Entity
    {
        [NotNullable]
        AddressEntity address;
        [NotNullValidator]
        public AddressEntity Address
        {
            get { return address; }
            set { Set(ref address, value); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string phone;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone
        {
            get { return phone; }
            set { Set(ref phone, value); }
        }

        [SqlDbType(Size = 24)]
        string fax;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 24), TelephoneValidator]
        public string Fax
        {
            get { return fax; }
            set { Set(ref fax, value); }
        }

        public static readonly SessionVariable<CustomerEntity> CurrentCustomerVariable = Statics.SessionVariable<CustomerEntity>("Customer");
        public static CustomerEntity Current
        {
            get { return CurrentCustomerVariable.Value; }
            set { CurrentCustomerVariable.Value = value; }
        }
    }


    [Serializable, EntityKind(EntityKind.Shared, EntityData.Transactional)]
    public class PersonEntity : CustomerEntity
    {  
        [NotNullable, SqlDbType(Size = 40)]
        string firstName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string FirstName
        {
            get { return firstName; }
            set { Set(ref firstName, value); }
        }

        [NotNullable, SqlDbType(Size = 40)]
        string lastName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string LastName
        {
            get { return lastName; }
            set { Set(ref lastName, value); }
        }

        [SqlDbType(Size = 10)]
        string title;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 10)]
        public string Title
        {
            get { return title; }
            set { Set(ref title, value); }
        }

        DateTime? dateOfBirth;
        [DateTimePrecissionValidator(DateTimePrecision.Days)]
        public DateTime? DateOfBirth
        {
            get { return dateOfBirth; }
            set { Set(ref dateOfBirth, value); }
        }

        bool corrupt;
        public bool Corrupt
        {
            get { return corrupt; }
            set { Set(ref corrupt, value); }
        }

        public override string IdentifiableIntegrityCheck()
        {
            using (this.Corrupt ? Corruption.AllowScope() : null)
            {
                return base.IdentifiableIntegrityCheck();
            }
        }

        protected override void PreSaving(ref bool graphModified)
        {
            base.PreSaving(ref graphModified);
            if (this.Corrupt && string.IsNullOrEmpty(base.IdentifiableIntegrityCheck()))
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
            return "{0} {1}".FormatWith(firstName, lastName);
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
        string companyName;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 40)]
        public string CompanyName
        {
            get { return companyName; }
            set { Set(ref companyName, value); }
        }

        [NotNullable, SqlDbType(Size = 30)]
        string contactName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 30)]
        public string ContactName
        {
            get { return contactName; }
            set { Set(ref contactName, value); }
        }

        [NotNullable, SqlDbType(Size = 30)]
        string contactTitle;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 30)]
        public string ContactTitle
        {
            get { return contactTitle; }
            set { Set(ref contactTitle, value); }
        }

        static Expression<Func<CompanyEntity, string>> ToStringExpression = e => e.CompanyName;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    public static class CustomerOperation
    {
        public static readonly ExecuteSymbol<CustomerEntity> Save = OperationSymbol.Execute<CustomerEntity>();
    }
}
