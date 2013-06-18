using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Signum.Engine;
using Signum.Engine.Maps;
using Signum.Utilities;
using Southwind.Load.Properties;
using Southwind.Logic;
using Southwind.Entities;
using Signum.Services;
using Signum.Entities;
using Signum.Engine.Authorization;
using Signum.Entities.Reflection;
using Signum.Engine.Chart;
using Signum.Engine.Operations;
using Signum.Entities.Translation;
using System.Globalization;
using Signum.Entities.Mailing;

namespace Southwind.Load
{
    class Program
    {
        static void Main(string[] args)
        {
            using (AuthLogic.Disable())
            using (Sync.ChangeCulture("en"))
            using (Sync.ChangeCultureUI("en"))
            {
                Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));


                Console.WriteLine("..:: Welcome to Southwind Loading Application ::..");
                Console.WriteLine("Database: {0}", Regex.Match(((SqlConnector)Connector.Current).ConnectionString, @"Initial Catalog\=(?<db>.*)\;").Groups["db"].Value);
                Console.WriteLine();

                while (true)
                {
                    Action action = new ConsoleSwitch<string, Action>
                    {
                        {"N", NewDatabase},
                        {"S", Synchronize},
                        {"L", Load},
                    }.Choose();

                    if (action == null)
                        return;

                    action();
                }
            }
        }

        private static void Load()
        {
            Schema.Current.InitializeUntil(InitLevel.Level0SyncEntities);
            
            OperationLogic.AllowSaveGlobally = true;

            while (true)
            {
                Action[] actions = new ConsoleSwitch<int, Action>
                    {
                        {0, EmployeeLoader.LoadRegions},
                        {1, EmployeeLoader.LoadTerritories},
                        {2, EmployeeLoader.LoadEmployees},
                        {3, ProductLoader.LoadSuppliers },
                        {4, ProductLoader.LoadCategories },
                        {5, ProductLoader.LoadProducts },
                        {6, CustomerLoader.LoadCompanies },
                        {7, CustomerLoader.LoadPersons },
                        {8, OrderLoader.LoadShippers },
                        {9, OrderLoader.LoadOrders },

                        {10, EmployeeLoader.FixEmployeeImages },
                        {11, EmployeeLoader.FixCategoryImages },
                 

                        {20, EmployeeLoader.CreateUsers },
                        {21, EmployeeLoader.CreateSystemUser }, 

                        {22, SnamphotIsolation},

                        {23, CreateCultureInfo},

                        {30, OrderLoader.UpdateOrdersDate },

                        {40, ChartScriptLogic.ImportExportChartScripts},

                        {100, ShowOrder},

                    }.ChooseMultiple();

                if (actions == null)
                    return;

                foreach (var acc in actions)
                {
                    Console.WriteLine("------- Executing {0} ".Formato(acc.Method.Name.SpacePascal(true)).PadRight(Console.WindowWidth - 2, '-'));
                    acc();
                }
            }
        }

        public static void NewDatabase()
        {
            Console.WriteLine("You will lose all your data. Sure? (Y/N)");
            string val = Console.ReadLine();
            if (!val.StartsWith("y") && !val.StartsWith("Y"))
                return;

            Console.Write("Creating new database...");
            Administrator.TotalGeneration();
            Console.WriteLine("Done.");
        }

        static void Synchronize()
        {
            Console.WriteLine("Check and Modify the synchronization script before");
            Console.WriteLine("executing it in SQL Server Management Studio: ");
            Console.WriteLine();

            SqlPreCommand command = Administrator.TotalSynchronizeScript();
            if (command == null)
            {
                Console.WriteLine("Already synchronized!");
                return;
            }

            command.OpenSqlFileRetry();
        }

        static void SnamphotIsolation()
        {
            Administrator.SetSnapshotIsolation(true);
            Administrator.MakeSnapshotIsolationDefault(true);
        }

        static void ShowOrder()
        {
            var query = Database.Query<OrderDN>()
              .Where(a => a.Details.Any(l => l.Discount != 0))
              .OrderByDescending(a => a.TotalPrice);

            OrderDN order = query.First();
        }

        public static void CreateCultureInfo()
        {
            var en = new CultureInfoDN(CultureInfo.GetCultureInfo("en")).Save();
            var es = new CultureInfoDN(CultureInfo.GetCultureInfo("es")).Save();

            new SouthwindConfigurationDN
            {
                Email = new EmailTemplateConfigurationDN
                {
                    DefaultCulture = es,
                    UrlLeft = "http://localhost/Southwind"
                }
            }.Save();
        }
    }
}
