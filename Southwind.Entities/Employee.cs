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
using Signum.Utilities.ExpressionTrees;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
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

        public Date? BirthDate { get; set; }

        public Date? HireDate { get; set; }

        public AddressEmbedded Address { get; set; }

        [StringLengthValidator(Min = 3, Max = 25), TelephoneValidator]
        public string? HomePhone { get; set; }

        [StringLengthValidator(Min = 3, Max = 4), TelephoneValidator]
        public string? Extension { get; set; }

        public Lite<FileEntity>? Photo { get; set; }

        [StringLengthValidator(Min = 3, MultiLine = true)]
        public string? Notes { get; set; }

        public Lite<EmployeeEntity>? ReportsTo { get; set; }

        [StringLengthValidator(Min = 3, Max = 255), URLValidator]
        public string? PhotoPath { get; set; }

        [NoRepeatValidator, NoRepeatValidator]
        public MList<TerritoryEntity> Territories { get; set; } = new MList<TerritoryEntity>();

        public override string ToString()
        {
            return "{0} {1}".FormatWith(FirstName, LastName);
        }

        public static Lite<EmployeeEntity>? Current
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
        public RegionEntity Region { get; set; }

        [UniqueIndex]
        [StringLengthValidator(Min = 3, Max = 100)]
        public string Description { get; set; }

        [AutoExpressionField]
        public override string ToString() => As.Expression(() => Description);
    }

    [AutoInit]
    public static class TerritoryOperation
    {
        public static ExecuteSymbol<TerritoryEntity> Save;
    }

    [Serializable, EntityKind(EntityKind.String, EntityData.Master)]
    public class RegionEntity : Entity
    {
        [UniqueIndex]
        [StringLengthValidator(Min = 3, Max = 50)]
        public string Description { get; set; }

        [AutoExpressionField]
        public override string ToString() => As.Expression(() => Description);
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
