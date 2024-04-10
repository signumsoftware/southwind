using System;
using System.IO;
using System.Globalization;
using System.Net;
using System.Text;
using System.Linq;
using System.Reflection;
using System.ComponentModel;
using System.Collections;
using System.Collections.Generic;
using System.Linq.Expressions;
using Signum.Utilities;
using Signum.Utilities.Reflection;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using Signum.CodeGen;
using Signum.Security;
using Signum.Operations;
using Signum.Entities;
using Signum.Entities.Validation;
using Signum.Entities.Reflection;
using Signum.Entities.Internal;
using Signum.Engine;
using Signum.Engine.Sync;
using Signum.Engine.Sync.SqlServer;
using Signum.Engine.Sync.Postgres;
using Signum.Engine.Maps;
using Signum.Engine.Linq;
using Signum.DynamicQuery;
using Signum.DynamicQuery.Tokens;
using Signum.CodeGeneration;
using Signum.Basics;
using Signum.API;
using Signum.API.Json;
using Signum.API.Filters;
using Signum.API.Controllers;
using Signum.API.ApiControllers;
using Signum.Authorization;
using Signum.Authorization.UserTicket;
using Signum.Authorization.SessionLog;
using Signum.Authorization.Rules;
using Signum.Authorization.AuthToken;
using Signum.Workflow;
using Southwind;
using Southwind.Shippers;
using Southwind.Public;
using Southwind.Products;
using Southwind.Orders;
using Southwind.Globals;
using Southwind.Employees;
using Southwind.Customers;

namespace Signum.CodeGen
{
    public static class CodeGenTypeConditionStarter
    {
        public static void Start(SchemaBuilder sb)
        {
        }
    }
    
    [AutoInit]
    public static class CodeGenTypeCondition
    {
    }
}
