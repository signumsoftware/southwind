using Signum.Engine.Maps;
using Signum.Entities.Basics;
using Southwind.Entities;
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
            DatabaseName logDb = new DatabaseName(null,logDatabaseName);

            schema.Table<OperationLogDN>().ToDatabase(logDb);
            schema.Table<ExceptionDN>().ToDatabase(logDb);
        }
    }
}
