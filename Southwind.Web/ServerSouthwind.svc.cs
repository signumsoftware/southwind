using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.Reflection;
using Signum.Entities;
using Signum.Engine;
using Signum.Entities.DynamicQuery;
using Signum.Engine.Maps;
using Signum.Engine.DynamicQuery;
using Signum.Entities.Basics;
using Signum.Services;
using Southwind.Services;
using Signum.Entities.Authorization;
using Signum.Engine.Authorization;

namespace Southwind.Web
{
    public class ServerSouthwind : ServerExtensions, IServerSouthwind
    {
       
    }
}
