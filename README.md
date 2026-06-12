# Objects Web API

A lightweight ASP.NET Core Web API that integrates with the public [Restful API](https://api.restful-api.dev/) service. It fetches and creates objects via the external API, then caches them locally in a SQLite database using Entity Framework Core.

## What it does

This API acts as a thin wrapper around `https://api.restful-api.dev`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/objects/{id}` | `GET` | Fetches an object from the external API by ID, saves it locally, and returns the result. |
| `/api/objects` | `POST` | Creates a new object on the external API using `name` and `price`, then caches it locally. |
| `/api/objects` | `GET` | Returns all objects stored in the local SQLite database (queried with LINQ + EF Core). |

### Example: Get object by ID

```http
GET /api/objects/7
```

Proxies to `GET https://api.restful-api.dev/objects/7` and returns:

```json
{
  "id": "7",
  "name": "Apple MacBook Pro 16",
  "data": {
    "year": 2019,
    "price": 1849.99,
    "CPU model": "Intel Core i9",
    "Hard disk size": "1 TB"
  }
}
```

### Example: Create object

```http
POST /api/objects
Content-Type: application/json

{
  "name": "Apple MacBook Pro 16",
  "price": 1849.99
}
```

Proxies to `POST https://api.restful-api.dev/objects`, mapping your request to the external API format (`name` + `data.price`).

## Architecture

The project follows a simple separation of concerns:

```
assessment/
├── Controllers/       # HTTP endpoints
├── Services/          # Business logic and external API client
├── Data/              # EF Core DbContext
└── Models/            # DTOs and entities
```

| Layer | Role |
|-------|------|
| **Controllers** | Handle HTTP requests and responses |
| **ObjectService** | Orchestrates external API calls and local persistence |
| **RestfulApiClient** | Typed `HttpClient` for restful-api.dev |
| **AppDbContext** | SQLite persistence via EF Core |

Dependencies are registered in `Program.cs` using ASP.NET Core dependency injection.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (or compatible version matching `net10.0` in the project file)
- Internet access (required for calls to `api.restful-api.dev`)

Verify your SDK installation:

```bash
dotnet --version
```

## How to run

1. **Clone or open the project**, then navigate to the API project folder:

   ```bash
   cd assessment
   ```

2. **Restore dependencies and build:**

   ```bash
   dotnet restore
   dotnet build
   ```

3. **Start the API:**

   ```bash
   dotnet run
   ```

   The API listens on **http://localhost:5020** by default (see `Properties/launchSettings.json`).

4. **Test an endpoint:**

   ```bash
   curl http://localhost:5020/api/objects/7
   ```

   Or use the included `assessment.http` file with the REST Client extension in VS Code / Visual Studio.

### Run with HTTPS profile

```bash
dotnet run --launch-profile https
```

This starts the app on `https://localhost:7281` and `http://localhost:5020`.

## Configuration

Settings are in `appsettings.json`:

| Setting | Default | Description |
|---------|---------|-------------|
| `ConnectionStrings:DefaultConnection` | `Data Source=objects.db` | SQLite database file path |
| `RestfulApi:BaseUrl` | `https://api.restful-api.dev/` | Base URL for the external API |

Override these in `appsettings.Development.json` or via environment variables:

```bash
# Windows (PowerShell)
$env:RestfulApi__BaseUrl = "https://api.restful-api.dev/"
$env:ConnectionStrings__DefaultConnection = "Data Source=objects.db"
```

## Troubleshooting

### `dotnet` command not found

Install the [.NET SDK](https://dotnet.microsoft.com/download) and restart your terminal. Confirm with `dotnet --version`.

### NuGet restore fails / packages not found

Ensure NuGet.org is configured as a package source:

```bash
dotnet nuget list source
```

If `nuget.org` is missing, add it:

```bash
dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org
```

Then run `dotnet restore` again.

### Port already in use (`Address already in use`)

Another process is using port 5020. Either stop that process or change the port in `Properties/launchSettings.json`:

```json
"applicationUrl": "http://localhost:5050"
```

### `GET /api/objects/{id}` returns 404

- The object may not exist on the external API. Try a known ID such as `7`.
- Check that `RestfulApi:BaseUrl` in `appsettings.json` is correct and ends with `/`.
- Verify you have internet connectivity and that https://api.restful-api.dev is reachable.

### `POST /api/objects` returns 400

- Ensure the request body includes both `name` (non-empty string) and `price` (positive number).
- Set the `Content-Type` header to `application/json`.

Example valid body:

```json
{
  "name": "Apple MacBook Pro 16",
  "price": 1849.99
}
```

### External API errors (500, timeout, connection refused)

The app depends on `api.restful-api.dev` being online. If the external service is down or slow:

- Check https://api.restful-api.dev/objects/7 directly in a browser or with `curl`.
- Review application logs in the terminal for `HttpRequestException` details.
- Retry after a short wait; the public API can be intermittently unavailable.

### Database issues

The SQLite file `objects.db` is created automatically on first run via `EnsureCreated()`. If you encounter schema problems:

1. Stop the running application.
2. Delete `objects.db` (and `objects.db-shm`, `objects.db-wal` if present).
3. Restart the app to recreate the database.

### HTTPS redirection warnings in development

When using the `http` profile only, some clients may be redirected to HTTPS. Use `http://localhost:5020` explicitly, or run with the `https` launch profile and trust the dev certificate:

```bash
dotnet dev-certs https --trust
```

## Project structure

```
assessment/
├── assessment/
│   ├── Controllers/
│   │   └── ObjectsController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   ├── CreateObjectRequest.cs
│   │   ├── ObjectEntity.cs
│   │   └── RestfulApiModels.cs
│   ├── Services/
│   │   ├── IObjectService.cs
│   │   ├── ObjectService.cs
│   │   ├── IRestfulApiClient.cs
│   │   └── RestfulApiClient.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── assessment.http
├── .gitignore
└── README.md
```
