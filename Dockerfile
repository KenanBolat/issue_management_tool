# -------- Build stage --------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution + csproj files first (better layer caching)
COPY SatelliteTicketTracker.sln ./
COPY src/Domain/Domain.csproj src/Domain/
COPY src/Application/Application.csproj src/Application/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/
COPY src/Api/Api.csproj src/Api/
COPY src/Web/Web.csproj src/Web/

# Restore only the API (brings referenced projects too)
RUN dotnet restore src/Api/Api.csproj

# Copy the rest
COPY src/ src/

# Publish
RUN dotnet publish src/Api/Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# -------- Runtime stage --------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# App listens on 5221 in your repo settings
ENV ASPNETCORE_URLS=http://0.0.0.0:5221
# Set to Development if you want Swagger enabled (your code enables Swagger only in Dev)
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 5221

COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "Api.dll"]