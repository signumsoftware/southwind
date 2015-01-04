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
using Signum.Engine.Help;
using Signum.Entities.Word;
using Signum.Engine.Basics;
using Signum.Engine.Migrations;

namespace Southwind.Load
{
    class Program
    {
        static int Main(string[] args)
        {
            try
            {
                using (AuthLogic.Disable())
                using (CultureInfoUtils.ChangeCulture("en"))
                using (CultureInfoUtils.ChangeCultureUI("en"))
                {
                    Starter.Start(UserConnections.Replace(Settings.Default.ConnectionString));

                    Console.WriteLine("..:: Welcome to Southwind Loading Application ::..");
                    Console.WriteLine("Database: {0}", Regex.Match(((SqlConnector)Connector.Current).ConnectionString, @"Initial Catalog\=(?<db>.*)\;").Groups["db"].Value);
                    Console.WriteLine();

                    if (args.Any())
                    {
                        switch (args.First().ToLower().Trim('-', '/'))
                        {
                            case "sql": SqlMigrationRunner.SqlMigrations(true); break;
                            case "csharp": CSharpMigrations(true); break;
                            case "load": Load(args.Skip(1).ToArray()); break;
                            default:
                            {
                                SafeConsole.WriteLineColor(ConsoleColor.Red, "Unkwnown command " + args.First());
                                Console.WriteLine("Examples:");
                                Console.WriteLine("   sql: SQL Migrations");
                                Console.WriteLine("   csharp: C# Migrations");
                                Console.WriteLine("   load 1-4,7: Load processes 1 to 4 and 7");
                                return -1;
                            }
                        }
                    } //if(args.Any())

                    while (true)
                    {
                        Action action = new ConsoleSwitch<string, Action>
                        {
                            {"N", NewDatabase},
                            {"SQL", SqlMigrationRunner.SqlMigrations},
                            {"CS", () => CSharpMigrations(false), "C# Migrations"},
                            {"S", Synchronize},
                            {"L", ()=>Load(null), "Load"},
                        }.Choose();

                        if (action == null)
                            return 0;

                        action();
                    }
                }
            }
            catch (Exception e)
            {
                SafeConsole.WriteColor(ConsoleColor.DarkRed, e.GetType().Name + ": ");
                SafeConsole.WriteLineColor(ConsoleColor.Red, e.Message);
                SafeConsole.WriteLineColor(ConsoleColor.DarkRed, e.StackTrace.Indent(4));
                return -1;
            }
        }

        private static void CSharpMigrations(bool autoRun)
        {
            Schema.Current.Initialize();

            OperationLogic.AllowSaveGlobally = true;

            new CSharpMigrationRunner
            {
                EmployeeLoader.LoadRegions,
                EmployeeLoader.LoadTerritories,
                EmployeeLoader.LoadEmployees,
                ProductLoader.LoadSuppliers,
                ProductLoader.LoadCategories,
                ProductLoader.LoadProducts,
                CustomerLoader.LoadCompanies,
                CustomerLoader.LoadPersons,
                OrderLoader.LoadShippers,
                OrderLoader.LoadOrders,
                EmployeeLoader.CreateUsers,
                EmployeeLoader.CreateSystemUser, 
                OrderLoader.UpdateOrdersDate,
                CreateCultureInfo,
                ChartScriptLogic.ImportChartScripts,
                ImportSpanishInstanceTranslations,
                ImportWordReportTemplateForOrder, 
            }.Run(autoRun); 
        } //CSharpMigrations

        private static void Load(string[] args)
        {
            Schema.Current.Initialize();

            OperationLogic.AllowSaveGlobally = true;

            while (true)
            {
                Action[] actions = new ConsoleSwitch<int, Action>
                {
                    {20, EmployeeLoader.CreateUsers },
                    {21, EmployeeLoader.CreateSystemUser },
                    {30, OrderLoader.UpdateOrdersDate },
                    {42, ChartScriptLogic.ImportExportChartScripts},
                    {43, AuthLogic.ImportExportAuthRules},
                    {44, ImportSpanishInstanceTranslations},
                    {45, HelpXml.ImportExportHelp},
                    {48, ImportWordReportTemplateForOrder},
                    {100, ShowOrder},
                }.ChooseMultiple();

                if (actions == null)
                    return;

                foreach (var acc in actions)
                {
                    Console.WriteLine("------- Executing {0} ".FormatWith(acc.Method.Name.SpacePascal(true)).PadRight(Console.WindowWidth - 2, '-'));
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
            var query = Database.Query<OrderEntity>()
              .Where(a => a.Details.Any(l => l.Discount != 0))
              .OrderByDescending(a => a.TotalPrice);

            OrderEntity order = query.First();
        }//ShowOrder

        public static void CreateCultureInfo()
        {
            var en = new CultureInfoEntity(CultureInfo.GetCultureInfo("en")).Save();
            var es = new CultureInfoEntity(CultureInfo.GetCultureInfo("es")).Save();

            new ApplicationConfigurationEntity
            {
                Environment = "Development",
                Email = new EmailConfigurationEntity
                {
                    SendEmails = true,
                    DefaultCulture = en,
                    UrlLeft = "http://localhost/Southwind"
                },
                Sms = new SMSConfigurationEntity
                {
                    DefaultCulture = en,
                }
            }.Save();
        }

        public static void ImportSpanishInstanceTranslations()
        {
            TranslatedInstanceLogic.ImportExcelFile("Category.es.View.xlsx");
        }

        public static void ImportWordReportTemplateForOrder()
        {
            new WordTemplateEntity
            {
                Name = "Order template",
                Query = QueryLogic.GetQueryEntity(typeof(OrderEntity)),
                Culture = CultureInfo.GetCultureInfo("en").ToCultureInfoEntity(),
                Template = new FileEntity("../../WordTemplates/Order.docx").ToLiteFat()
            }.Save();
        }
    }
}
