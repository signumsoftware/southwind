using Pgvector;
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

    [DbType(Size = 768), InTypeScript(false), HiddenProperty]
    public Vector? Embedding { get; set; }

    public int Index { get; set; }

    [AutoExpressionField]
    public override string ToString() => As.Expression(() => Employee.ToString()!);
}
