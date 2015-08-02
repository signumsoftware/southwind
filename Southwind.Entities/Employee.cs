using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Utilities;
using Signum.Entities.Basics;
using System.Data;
using Signum.Entities.Authorization;
using System.Linq.Expressions;
using Signum.Entities.Files;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class EmployeeEntity : Entity
    {
        [NotNullable, SqlDbType(Size = 20)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 20)]
        public string LastName { get; set; }

        [NotNullable, SqlDbType(Size = 10)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 10)]
        public string FirstName { get; set; }

        [SqlDbType(Size = 30)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 30)]
        public string Title { get; set; }

        [SqlDbType(Size = 25)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 25)]
        public string TitleOfCourtesy { get; set; }

        [DateTimePrecissionValidator(DateTimePrecision.Days)]
        public DateTime? BirthDate { get; set; }

        public DateTime? HireDate { get; set; }

        [NotNullable]
        [NotNullValidator]
        public AddressEntity Address { get; set; }

        [SqlDbType(Size = 25)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 25), TelephoneValidator]
        public string HomePhone { get; set; }

        [SqlDbType(Size = 4)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 4), TelephoneValidator]
        public string Extension { get; set; }

        public Lite<FileEntity> Photo { get; set; }

        [SqlDbType(Size = int.MaxValue),]
        [StringLengthValidator(AllowNulls = true, Min = 3, MultiLine = true)]
        public string Notes { get; set; }

        public Lite<EmployeeEntity> ReportsTo { get; set; }

        [SqlDbType(Size = 255)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 255), URLValidator]
        public string PhotoPath { get; set; }

        [NotNullable]
        [NoRepeatValidator]
        public MList<TerritoryEntity> Territories { get; set; } = new MList<TerritoryEntity>();

        public override string ToString()
        {
            return "{0} {1}".FormatWith(FirstName, LastName);
        }

        public static EmployeeEntity Current
        {
            get { return UserEntity.Current.Mixin<UserEmployeeMixin>().Employee; } //get { return null; }
        } //Current
    }

    [AutoInit]
    public static class EmployeeOperation
    {
        public static ExecuteSymbol<EmployeeEntity> Save;
    }

    [Serializable, EntityKind(EntityKind.String, EntityData.Master)]
    public class TerritoryEntity : Entity
    {
        [NotNullValidator]
        public RegionEntity Region { get; set; }

        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string Description { get; set; }

        static Expression<Func<TerritoryEntity, string>> ToStringExpression = e => e.Description;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class TerritoryOperation
    {
        public static ExecuteSymbol<TerritoryEntity> Save;
    }

    [Serializable, EntityKind(EntityKind.String, EntityData.Master)]
    public class RegionEntity : Entity
    {
        [NotNullable, SqlDbType(Size = 50), UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 50)]
        public string Description { get; set; }

        static Expression<Func<RegionEntity, string>> ToStringExpression = e => e.Description;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class RegionOperation
    {
        public static ExecuteSymbol<RegionEntity> Save;
    }

    public enum EmployeeQuery
    {
        EmployeesByTerritory
    }
}
