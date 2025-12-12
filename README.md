# issue_management_tool
## Migration reset and apply 
 - Drop the DB

- dotnet ef database drop   --project ./Infrastructure/Infrastructure.csproj  --startup-project ./Api/Api.csproj --context AppDbContext --force

-  Remove old migrations (either delete the folder or remove step-by-step)

```bash
  rm -rf ./Infrastructure/Migrations
```


```bash
# Alternative Method
 while dotnet ef migrations remove --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj; do :; done
 ```


- Clean build artifacts
```bash
  dotnet clean
  rm -rf **/bin **/obj
  dotnet build
```

- Create a brand-new migration

```bash
dotnet ef migrations add InitialSchema  --project ./Infrastructure/Infrastructure.csproj  --startup-project ./Api/Api.csproj  --context AppDbContext
```

- Apply it (creates a fresh database)

```bash
dotnet ef database update   --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj --context AppDbContext
```

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
```

> For caching install additional package 
```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis --version 8.0.0
```

> REDIS checks 
  - redis-cli
  - PING 
  - KEYS * 
  - HGETALL <KEYNAME>
  - FLUSHALL 

> For caching install additional package
```bash  
dotnet add package Microsoft.AspNetCore.SignalR --version 8.0.0
```

> npm added 
```bash 
npm install @microsoft/signalr
```

> For docker service check: 
```bash 
dotnet add package Docker.DotNet
```

### Possible problems while deploying
 1. Add all the packages for the dotnet:

    -  dotnet add package Microsoft.EntityFrameworkCore --version 8.0.0
    -  dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
    -  dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0
    -  dotnet add package Microsoft.AspNetCore.SignalR --version 8.0.0
    -  dotnet add package Docker.DotNet 

  2. Update the database: 

    - dotnet ef -v  database update   --project ./Infrastructure/Infrastructure.csproj   --startup-project ./Api/Api.csproj   --context AppDbContext

  3. Add progress_info column if necessary:
  
    - ALTER TABLE "ProgressRequests"   ADD COLUMN progress_info text NULL;
    
  4. Carriage Return Error:
    
    - dos2unix or manually CRF to LF from the vscode



--IF ERROR 
-- Step 1: Drop the incorrectly named constraint
ALTER TABLE progress_request_update 
DROP CONSTRAINT IF EXISTS "FK_progress_request_update_user_UpdatedById";

-- Step 2: Create the correct foreign key constraint
ALTER TABLE progress_request_update
ADD CONSTRAINT fk_progress_request_update_updated_by
    FOREIGN KEY (updated_by_user_id) 
    REFERENCES users(id) 
    ON DELETE RESTRICT;

-- Verify the constraint was created correctly
```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'progress_request_update'
    AND kcu.column_name = 'updated_by_user_id';
```

```sql
alter table progress_request_update rename column "UpdatedById" to updated_by_id; 
```

```
otnet ef migrations list   --project ./Infrastructure/Infrastructure.csproj   --startup-project ./Api/Api.csproj   --context AppDbContext
```

```
dotnet ef migrations remove   --project ./Infrastructure/Infrastructure.csproj   --startup-project ./Api/Api.csproj   --context AppDbContext
```
