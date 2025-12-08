# GitHub Copilot Repository Instructions

## Project Overview
- **Type:** Signum Framework SPA
- **Main Project:** Southwind/Southwind.csproj
- **.NET Version:** 10.0
- **UI Framework:** React (TypeScript SPA)

## General Guidance
- Use Signum Framework conventions for entities, queries, operations, react components, etc...
- Add minimal comments only if necesary.
- Respect existing folder and module structure: code is organized by feature/module, not by technical concern.
- Framework is a git submodule with shared code.
- Framework\Extensions contains many reusable vertical modules with both C# and TypeScript.
- The solution is large; avoid compiling the entire solution unless necessary. Prefer compiling only the affected project.
- For TypeScript code, use `yarn tsc --build` to compile a csproj project with a tsconfig file.

## Language-Specific Guidance

### C#
- Prefer static classes for logic over dependency injection.
- Prefer synchronous logic for methods used by operations or processes.
- Use Signum LINQ provider for queries, not EF or SQL.
- Avoid dependency injection unless ASP.Net extensibility requires it.
- Follow Signum static logic registration patterns.
- Use not nullable reference types, but allow DTOs without default values or constructors (often deserialized).

### TypeScript / React
- Prioritize React and TypeScript for UI code.
- Use Bootstrap, React-Bootstrap, and Font Awesome icons for UI components.
- Type all props and state (using isolatedDeclarations).
- Use functional React components as simple functions.
- Prefer Signum hooks (e.g., useAPI, useForceUpdate) over state management libraries.
- Use strict mode in TypeScript.
- Allow imperative modification of entities in React components; do not enforce strict immutability.
