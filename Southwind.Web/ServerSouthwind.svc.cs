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
using Signum.Entities.Disconnected;
using Signum.Engine.Disconnected;
using Signum.Utilities;
using Signum.Engine.Exceptions;
using Signum.Engine.Basics;
using Southwind.Entities;

namespace Southwind.Web
{
    public class ServerSouthwind : ServerExtensions, IServerSouthwind
    {
        protected override T Return<T>(MethodBase mi, string description, Func<T> function)
        {
            try
            {
                using (ScopeSessionFactory.OverrideSession(session))
                using (HeavyProfiler.Log("WCF", () => mi.Name + ": " + description))
                {
                    return function();
                }
            }
            catch (Exception e)
            {
                e.LogException(el =>
                {
                    el.ControllerName = GetType().Name;
                    el.ActionName = mi.Name;
                    el.QueryString = description;
                    el.Version = Schema.Current.Version.ToString();
                });
                throw new FaultException(e.Message);
            }
            finally
            {
                Statics.CleanThreadContextAndAssert();
            }
        }

        public override void Login(string username, string passwordHash)
        {
            Execute(MethodInfo.GetCurrentMethod(), null, () =>
            {
                var user = AuthLogic.Login(username, passwordHash);

                if(user.Mixin<UserMixin>().AllowLogin == AllowLogin.WebOnly)
                    throw new UnauthorizedAccessException("Windows login not allowed"); 

                UserDN.Current = user;
            });
        } //Login

        public DisconnectedExportDN GetDownloadEstimation(Lite<DisconnectedMachineDN> machine)
        {
            return Return(MethodInfo.GetCurrentMethod(), () => DisconnectedLogic.GetDownloadEstimation(machine)); 
        }

        public Lite<DisconnectedMachineDN> GetDisconnectedMachine(string machineName)
        {
            return Return(MethodInfo.GetCurrentMethod(), () => DisconnectedLogic.GetDisconnectedMachine(machineName));
        }

        public DisconnectedImportDN GetUploadEstimation(Lite<DisconnectedMachineDN> machine)
        {
            return Return(MethodInfo.GetCurrentMethod(), () => DisconnectedLogic.GetUploadEstimation(machine));
        }

        public Dictionary<Type, StrategyPair> GetStrategyPairs()
        {
            return Return(MethodInfo.GetCurrentMethod(), () =>
                DisconnectedLogic.GetStrategyPairs());
        }

        public void SkipExport(Lite<DisconnectedMachineDN> machine)
        {
            Execute(MethodInfo.GetCurrentMethod(), () =>
                 DisconnectedLogic.ImportManager.SkipExport(machine));
        }

        public void ConnectAfterFix(Lite<DisconnectedMachineDN> machine)
        {
            Execute(MethodInfo.GetCurrentMethod(), () =>
                 DisconnectedLogic.ImportManager.ConnectAfterFix(machine));
        }
    }
}
