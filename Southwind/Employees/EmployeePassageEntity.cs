using Signum.Entities;
using Signum.Utilities;

namespace Southwind.Employees;

[EntityKind(EntityKind.System, EntityData.Transactional)]
public class EmployeePassageEntity : Entity
{   
    public Lite<EmployeeEntity> Employee { get; set; }

    public bool IsTitle { get; set; }

    [StringLengthValidator(Max = int.MaxValue)]
    public string Chunk { get; set; }

    public int Index { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => Employee.ToString()!);
}