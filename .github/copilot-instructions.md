<!-- .github/copilot-instructions.md
     Purpose: brief, actionable guidance to help AI coding agents become productive in this repo.
     Keep this file small and specific to discovered, observable patterns. Update when structure changes.
-->

# Copilot / AI agent quick guide — issue_management_tool

Summary: This mono-repo contains a .NET backend (Api, Web, Application, Domain, Infrastructure) and a React + Vite frontend in `frontend/`.
The backend uses EF Core with a Postgres connection string, JWT auth, and a DB seeding helper. The frontend talks to the API under `/api/*`.

Key locations (read these first):
- `src/Api/Program.cs` — application bootstrap, JWT auth setup, DB migration & seeding (calls `DbSeeder.SeedAsync`).
- `src/Infrastructure/Data/DbSeeder.cs` — database seed data (users, military ranks, systems, sample tickets). Useful default credentials are present here.
- `src/Api/Controllers/` — Web API surface (e.g. `TicketsController.cs`) — controllers call services in `Application/Services`.
- `src/Application/Services/TicketService.cs` — core business rules for tickets (status transitions, summarize on close).
- `Domain/Entities` and `Domain/Enums` — canonical data shapes and enums used across the stack.
- `frontend/` — React + Vite UI; key files: `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/components/*`, and `frontend/services/api.jsx` (API client).

Big-picture architecture / data flow (short):
- API controllers (e.g. `TicketsController`) are thin: they validate/parse input and call `Application.Services` for business logic.
- `Application/Services` is where domain rules live (e.g. `TicketService.ChangeStatusAsync` enforces allowed transitions via `IsValidTransition`).
- `Infrastructure` contains EF Core DbContext, migrations, and seeding (`DbSeeder`). DB migrations are done with `dotnet ef` against `Infrastructure/Infrastructure.csproj` and the startup project `Api/Api.csproj`.
- Frontend is standalone and communicates over HTTP to the API endpoints at `/api/*`. The frontend stores JWT in `localStorage` and controls UI permissions by the stored `role` value.

Developer workflows & run commands (executable from repo root)
- Run backend API (development):
  - dotnet run --project src/Api/Api.csproj
  - The API will attempt to apply migrations and seed the DB on startup (see `Program.cs`).
- Run the Web UI (Razor pages) separately if needed:
  - dotnet run --project src/Web/Web.csproj
- Run frontend (dev server):
  - cd frontend && npm install && npm run dev
  - The workspace contains an npm task `npm: dev` (Vite) if using the VS Code task runner.
- EF Core migrations / reset (from README):
  - dotnet ef database drop --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj --context AppDbContext --force
  - dotnet ef migrations add <Name> --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj --context AppDbContext
  - dotnet ef database update --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj --context AppDbContext

Project-specific conventions & patterns
- Soft delete: Tickets expose `IsDeleted` and most queries rely on EF Core query filters; controllers call `IgnoreQueryFilters()` when admin needs to see deleted rows (see `TicketsController.GetTickets`).
- Role strings used in authorization: `Admin`, `Editor`, `Viewer`. Controllers often use `[Authorize(Roles = "Editor,Admin")]`.
- Status transitions are enforced in `TicketService.IsValidTransition` — modify only there to change allowed flows.
- Seeded test credentials are defined inside `DbSeeder.cs` (e.g. `admin@example.com` / `adminpasswd`, `editor@example.com` / `editorpasswd`). Use them for dev only.
- Excel and PDF export are implemented server-side (ExcelExportService) and client-side (pdfGenerator in `frontend/src/utils`). Exports are triggered from the Tickets UI (`TicketsTable.jsx`).

Integration notes / secrets
- JWT configuration: `src/Api/Program.cs` reads `Jwt:SecretKey`, `Jwt:Issuer`, `Jwt:Audience` from configuration (appsettings*.json or environment). Ensure a secure secret in non-dev environments.
- Database connection: the Postgres `DefaultConnection` is read from `src/Api/appsettings.json` / `appsettings.Development.json` or env vars. Migrations target `Infrastructure/Infrastructure.csproj`.

Quick code examples to reference when editing behavior
- Enforce ticket status transitions: edit `src/Application/Services/TicketService.cs` — method `IsValidTransition` centralizes allowed moves.
- Add API endpoint: create controller under `src/Api/Controllers/`, follow pattern in `TicketsController.cs` (route: `[Route("api/[controller]")]`, inject `AppDbContext` and service classes via constructor).
- Change seeding data: update `src/Infrastructure/Data/DbSeeder.cs` and restart the API after dropping the DB if you need a fresh seed.

What AI agents should not change automatically
- Do not change secrets (JWT secret, DB connection) in checked-in appsettings — these are env-specific. If you must, prefer environment variables.
- Avoid changing EF model classes without also updating migrations and running them.

If something's missing or unclear
- I pulled these patterns from `src/Api/Program.cs`, `src/Api/Controllers/TicketsController.cs`, `src/Application/Services/TicketService.cs`, `src/Infrastructure/Data/DbSeeder.cs`, and `frontend/` files. If you want I can:
  - Add short examples of common edits (e.g., adding a new ticket action + migration).
  - Auto-generate a checklist for making database-backed changes (model → migration → seed → tests → API endpoint → frontend wiring).

-- end
