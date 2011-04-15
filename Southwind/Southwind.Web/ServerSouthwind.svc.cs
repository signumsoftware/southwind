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

namespace Southwind.Web
{
    public class ServerSouthwind : ServerBasic, IServerSouthwind
    {
        protected override T Return<T>(MethodBase mi, string description, Func<T> function)
        {
            try
            {
                //Do Security, Tracing and Logging here
                return function();
            }
            catch (Exception e)
            {
                throw new FaultException(e.Message);
            }
        }
    }
}
