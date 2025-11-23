# issue_management_tool
## Migration reset and apply 
 - Drop the DB

dotnet ef database drop   --project ./Infrastructure/Infrastructure.csproj  --startup-project ./Api/Api.csproj --context AppDbContext --force

 -  Remove old migrations (either delete the folder or remove step-by-step)

```bash  rm -rf ./Infrastructure/Migrations ```

> (Alternative)
```bash while dotnet ef migrations remove --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj; do :; done```


- Clean build artifacts
```bash dotnet clean
rm -rf **/bin **/obj
dotnet build
```

- Create a brand-new migration

```bash dotnet ef migrations add InitialSchema  --project ./Infrastructure/Infrastructure.csproj  --startup-project ./Api/Api.csproj  --context AppDbContext ```

- Apply it (creates a fresh database)

```bash dotnet ef database update   --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj --context AppDbContext```





>fast drop 
```bash
 dotnet ef database drop -v   --project ./Infrastructure/Infrastructure.csproj   --startup-project ./Api/Api.csproj   --context AppDbContext --force 
```

>fast update
```bash
dotnet ef -v  database update   --project ./Infrastructure/Infrastructure.csproj   --startup-project ./Api/Api.csproj   --context AppDbContext
```


> Start Backend 
```bash
cd src/Api
dotnet run --host 0.0.0.0  
```

> Start Frontend 
```bash 
cd frontend 
npm run dev -- --host 0.0.0.0



> For caching install additional package 
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis --version 8.0.0

> REDIS checks 
  - redis-cli
  - PING 
  - KEYS * 
  - HGETALL <KEYNAME>
  - FLUSHALL 