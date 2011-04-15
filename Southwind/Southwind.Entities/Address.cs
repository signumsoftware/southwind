using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;

namespace Southwind.Entities
{


    [Serializable]
    public class AddressDN : EmbeddedEntity
    {
        [NotNullable, SqlDbType(Size = 60)]
        string address;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 60)]
        public string Address
        {
            get { return address; }
            set { Set(ref address, value, () => Address); }
        }

        [NotNullable, SqlDbType(Size = 15)]
        string city;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 15)]
        public string City
        {
            get { return city; }
            set { Set(ref city, value, () => City); }
        }

        [NotNullable, SqlDbType(Size = 15)]
        string region;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 15)]
        public string Region
        {
            get { return region; }
            set { Set(ref region, value, () => Region); }
        }

        [NotNullable, SqlDbType(Size = 10)]
        string postalCode;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 10)]
        public string PostalCode
        {
            get { return postalCode; }
            set { Set(ref postalCode, value, () => PostalCode); }
        }

        [NotNullable, SqlDbType(Size = 15)]
        string country;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 15)]
        public string Country
        {
            get { return country; }
            set { Set(ref country, value, () => Country); }
        }
    }
}
