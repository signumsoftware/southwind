# AI Agent Instructions for Southwind

**Read [`Framework/AGENTS.md`](Framework/AGENTS.md) first** — it contains all Signum Framework conventions (entities, operations, logic, React components, localization, build system).

This file only covers Southwind-specific details.

---

## Project Structure
- **Southwind/** — Main library: entities, logic, and React components organized by module (Customers, Employees, Orders, Products, Shippers, Globals).
- **Southwind.Server/** — ASP.NET Core host, Vite dev server (port 3000), API controllers.
- **Southwind.Terminal/** — Console app for database migrations and data loading.
- **Southwind.Test.Logic/** — xUnit tests for business logic.
- **Southwind.Test.React/** — Selenium UI tests.
- **Southwind.Test.Environment/** — Shared test setup and database configuration.
- **Framework/** — Signum Framework git submodule (do not modify directly from this repo).

## Key Files
- `Southwind/Starter.cs` — Central bootstrapping. Registers all framework extensions and app modules via `Start()`.
- `Southwind/MainAdmin.tsx` — Imports and starts all module clients (`CustomersClient`, `OrdersClient`, etc.).
- `Southwind/Layout.tsx` — Main application shell (navbar, sidebar, modals).
- `Southwind.Server/Program.cs` — Server entry point, calls `Starter.Start()`.
- `Modules.xml` — Configuration for optional/removable modules.

## Domain Model
Based on Northwind: **Customers** (Person, Company — polymorphic), **Orders** (with state machine: New → Ordered → Shipped | Canceled), **Products** (with Category, Supplier), **Employees**, **Shippers**. **ApplicationConfigurationEntity** is the global settings singleton.

## Build & Run
- **C#:** `dotnet build Southwind/Southwind.csproj` (not the entire solution).
- **TypeScript:** `yarn tsgo --build` from the Southwind folder.
- **Dev server:** `yarn dev` from Southwind.Server (Vite on port 3000).
- **Tests:** `dotnet test Southwind.Test.Logic/Southwind.Test.Logic.csproj`.