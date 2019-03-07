using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Signum.Engine;
using Signum.Engine.Maps;
using Signum.Utilities;
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
using Signum.Entities.Authorization;
using Signum.Engine.CodeGeneration;
using Signum.Entities.MachineLearning;
using Signum.Engine.MachineLearning;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Southwind.Load
{
    class Program
    {
        public static IConfigurationRoot ConfigRoot;

        static int Main(string[] args)
        {
            try
            {
                using (AuthLogic.Disable())
                using (CultureInfoUtils.ChangeCulture("en"))
                using (CultureInfoUtils.ChangeCultureUI("en"))
                {
                    ConfigRoot = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", true)
                        .AddUserSecrets<Program>().Build();

                    var connectionString = ConfigRoot.GetConnectionString("ConnectionString");
                    Starter.Start(connectionString);

                    Console.WriteLine("..:: Welcome to Southwind Loading Application ::..");
                    Console.WriteLine("Database: {0}", Regex.Match(((SqlConnector)Connector.Current).ConnectionString, @"Initial Catalog\=(?<db>.*)\;").Groups["db"].Value);
                    Console.WriteLine();

                    if (args.Any())
                    {
                        switch (args.First().ToLower().Trim('-', '/'))
                        {
                            case "sql": SqlMigrationRunner.SqlMigrations(true); return 0;
                            case "csharp": SouthwindMigrations.CSharpMigrations(true); return 0;
                            case "load": Load(args.Skip(1).ToArray()); return 0;
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
                            {"G", CodeGenerator.GenerateCodeConsole },
                            {"SQL", SqlMigrationRunner.SqlMigrations},
                            {"CS", () => SouthwindMigrations.CSharpMigrations(false), "C# Migrations"},
                            {"S", Synchronize},
                            {"L", () => Load(null), "Load"},
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



        private static void Load(string[] args)
        {
            Schema.Current.Initialize();

            OperationLogic.AllowSaveGlobally = true;

            while (true)
            {
                var actions = new ConsoleSwitch<string, Action>
                {
                    {"AR", AuthLogic.ImportExportAuthRules},
                    {"HL", HelpXml.ImportExportHelp},
                    {"TP", TrainPredictor},
                    {"SO", ShowOrder},
                }.ChooseMultipleWithDescription(args);

                if (actions == null)
                    return;

                foreach (var acc in actions)
                {
                    MigrationLogic.ExecuteLoadProcess(acc.Value, acc.Description);
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

        static void TrainPredictor()
        {
            using (AuthLogic.UnsafeUserSession("Steven"))
            {
                var predictor = Database.Query<PredictorEntity>().SingleEx(a => a.Id == 2);
                predictor.TrainSync();
            }
        }//TrainPredictor
    }
}
