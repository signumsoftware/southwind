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
using Signum.Entities.Files;
using Signum.Entities.SMS;
using Signum.Entities.Basics;
using Signum.Engine.Translation;

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
            Schema.Current.Initialize();

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

                    {20, EmployeeLoader.CreateUsers },
                    {21, EmployeeLoader.CreateSystemUser }, 

                    {30, OrderLoader.UpdateOrdersDate },

                    {41, CreateCultureInfo},
                    {42, ChartScriptLogic.ImportExportChartScripts},
                    {43, AuthLogic.ImportExportAuthRules},
                    {44, ImportSpanishInstanceTranslations},
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
                SafeConsole.WriteLineColor(ConsoleColor.Green, "Already synchronized!");
                return;
            }

            command.OpenSqlFileRetry();
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

            new ApplicationConfigurationDN
            {
                Environment = "Development",
                Email = new EmailConfigurationDN
                {
                    SendEmails = true,
                    DefaultCulture = en,
                    UrlLeft = "http://localhost/Southwind"
                },
                Sms = new SMSConfigurationDN
                {
                    DefaultCulture = en,
                }
            }.Save();
        }

        public static void ImportSpanishInstanceTranslations()
        {
            TranslatedInstanceLogic.ImportExcelFile("../../Category.es.View.xlsx");
        }

    }
}
