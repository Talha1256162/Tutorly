# Tutorly

Tutorly is a tutoring marketplace application with a .NET 8 API, SQL Server database scripts, and an Angular web frontend.

## Project Structure

- `backend/` - .NET 8 solution projects for API, application contracts, domain models, infrastructure, and shared response types.
- `frontend/tutorlypk-web/` - Angular frontend application.
- `database/` - SQL schema and seed scripts.
- `docs/` - UI reference and local screenshot assets.

## Backend

```bash
dotnet restore Tutorly.slnx
dotnet run --project backend/Tutorly.Api/Tutorly.Api.csproj
```

The API uses `backend/Tutorly.Api/appsettings.json` for local SQL Server and JWT configuration. Replace the placeholder JWT signing key before production use.
If a Debug build fails because `Tutorly.Api.exe` is locked, stop the running local API process or build with `-c Release`.

## Frontend

```bash
cd frontend/tutorlypk-web
npm install
npm start
```

Run the Playwright smoke regression with:

```bash
npm test
```

## Database

Run `database/schema.sql` and `database/seed.sql` against a fresh database. For existing databases, apply the numbered scripts in `database/migrations/` in order.
