# issue_management_tool
## Migration reset and apply 
# 1) Drop the DB
dotnet ef database drop \
  --project ./Infrastructure/Infrastructure.csproj \
  --startup-project ./Api/Api.csproj \
  --context AppDbContext --force

# 2) Remove old migrations (either delete the folder or remove step-by-step)
rm -rf ./Infrastructure/Migrations
# (Alternative)
# while dotnet ef migrations remove --project ./Infrastructure/Infrastructure.csproj --startup-project ./Api/Api.csproj; do :; done

# 3) Clean build artifacts
dotnet clean
rm -rf **/bin **/obj
dotnet build

# 4) Create a brand-new migration
dotnet ef migrations add InitialSchema \
  --project ./Infrastructure/Infrastructure.csproj \
  --startup-project ./Api/Api.csproj \
  --context AppDbContext

# 5) Apply it (creates a fresh database)
dotnet ef database update \
  --project ./Infrastructure/Infrastructure.csproj \
  --startup-project ./Api/Api.csproj \
  --context AppDbContext


