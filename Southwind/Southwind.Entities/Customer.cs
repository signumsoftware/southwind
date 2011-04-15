using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Utilities;

namespace Southwind.Entities
{
    [Serializable]
    public abstract class CustomerDN : Entity
    {
        AddressDN address;
        public AddressDN Address
        {
            get { return address; }
            set { Set(ref address, value, () => Address); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string phone;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone
        {
            get { return phone; }
            set { Set(ref phone, value, () => Phone); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string fax;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Fax
        {
            get { return fax; }
            set { Set(ref fax, value, () => Fax); }
        }
    }

    [Serializable]
    public class PersonDN : CustomerDN
    {  
        [NotNullable, SqlDbType(Size = 40)]
        string firstName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string FirstName
        {
            get { return firstName; }
            set { Set(ref firstName, value, () => FirstName); }
        }

        [NotNullable, SqlDbType(Size = 40)]
        string lastName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 40)]
        public string LastName
        {
            get { return lastName; }
            set { Set(ref lastName, value, () => LastName); }
        }

        [NotNullable, SqlDbType(Size = 10)]
        string title;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 10)]
        public string Title
        {
            get { return title; }
            set { Set(ref title, value, () => Title); }
        }

        DateTime dateOfBirth;
        [DateTimePrecissionValidator(DateTimePrecision.Days)]
        public DateTime DateOfBirth
        {
            get { return dateOfBirth; }
            set { Set(ref dateOfBirth, value, () => DateOfBirth); }
        }

        public override string ToString()
        {
            return "{0} {1}".Formato(firstName, lastName);
        }
    }

    [Serializable]
    public class CompanyDN : CustomerDN
    {
        [SqlDbType(Size = 40)]
        string companyName;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 40)]
        public string CompanyName
        {
            get { return companyName; }
            set { Set(ref companyName, value, () => CompanyName); }
        }

        [NotNullable, SqlDbType(Size = 30)]
        string contactName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 30)]
        public string ContactName
        {
            get { return contactName; }
            set { Set(ref contactName, value, () => ContactName); }
        }

        [NotNullable, SqlDbType(Size = 10)]
        string contactTitle;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 10)]
        public string ContactTitle
        {
            get { return contactTitle; }
            set { Set(ref contactTitle, value, () => ContactTitle); }
        }

        public override string ToString()
        {
            return companyName;
        }
    }
}
