using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;

namespace Southwind.Entities
{
    [Serializable]
    public class CustomerDN : Entity
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

        [NotNullable, SqlDbType(Size = 30)]
        string contactTitle;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 30)]
        public string ContactTitle
        {
            get { return contactTitle; }
            set { Set(ref contactTitle, value, () => ContactTitle); }
        }

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
}
