using Signum.Engine.Maps;
using Signum.Entities.Basics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Southwind.Logic
{
    public static partial class Starter
    {
        public static void SetLogDatabase(Schema schema, string logDatabaseName)
        {
            NamePrefix np = new NamePrefix { DatabaseName = logDatabaseName };

            schema.Table<OperationLogDN>().Prefix = np;
            schema.Table<ExceptionDN>().Prefix = np;
        }
    }
}
