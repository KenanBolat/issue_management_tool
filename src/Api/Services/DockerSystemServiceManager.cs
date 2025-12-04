using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Api.Services
{
    public class DockerSystemServiceManager : ISystemServiceManager
    {
        private readonly ILogger<DockerSystemServiceManager> _logger;
        private readonly DockerClient _client;

        // Map logical names ("db", "redis", "backup") to container names in docker-compose
        private readonly Dictionary<string, string> _nameMap;

        public DockerSystemServiceManager(
            ILogger<DockerSystemServiceManager> logger,
            IConfiguration config)
        {
            _logger = logger;

            // Use DOCKER_HOST if set, else local socket (Linux)
            var dockerHost = Environment.GetEnvironmentVariable("DOCKER_HOST");
                       


            if (string.IsNullOrWhiteSpace(dockerHost))
            {
                if (OperatingSystem.IsWindows())
                {
                    // Default Windows Docker Engine named pipe Docker + Docker Desktop
                    dockerHost = "npipe://./pipe/docker_engine";
                }
                else
                {
                    // Default Linux Docker socket
                    dockerHost = "unix:///var/run/docker.sock";
                }
            }
            _logger.LogInformation("Connecting to Docker daemon at {DockerHost}", dockerHost);


            _client = new DockerClientConfiguration(new Uri(dockerHost))
            .CreateClient();

            // You can also put this mapping in appsettings.json
            _nameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                // either the "container_name" or the actual container name (service + suffix)
                ["db"] = "satellite_tickets_db",
                ["redis"] = "redis",
                ["backup"] = "satellite_tickets_backup" 
            };
        }

        public async Task<SystemServiceStatus> GetStatusAsync(string name)
        {
            if (!_nameMap.TryGetValue(name, out var containerName))
            {
                return new SystemServiceStatus(
                    Status: "Error",
                    Description: $"Unknown service '{name}'",
                    CanStart: false);
            }

            try
            {
                var containers = await _client.Containers.ListContainersAsync(
                    new ContainersListParameters
                    {
                        All = true,
                        Filters = new Dictionary<string, IDictionary<string, bool>>
                        {
                            ["name"] = new Dictionary<string, bool>
                            {
                                [containerName] = true
                            }
                        }
                    });

                var container = containers.FirstOrDefault();
                if (container == null)
                {
                    return new SystemServiceStatus(
                        Status: "Error",
                        Description: $"Container '{containerName}' not found",
                        CanStart: true);
                }

                var state = container.State?.ToLowerInvariant() ?? "unknown";
                _logger.LogInformation("Service {Service} container {Container} state: {State}",
                    name, containerName, state);

                return state switch
                {
                    "running" => new SystemServiceStatus(
                        Status: "Running",
                        Description: "Container is running",
                        CanStart: false),

                    "exited" or "created" or "dead" => new SystemServiceStatus(
                        Status: "Stopped",
                        Description: $"Container state: {state}",
                        CanStart: true),

                    _ => new SystemServiceStatus(
                        Status: "Error",
                        Description: $"Container in unexpected state: {state}",
                        CanStart: true)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking status for service {Service}", name);
                return new SystemServiceStatus(
                    Status: "Error",
                    Description: "Failed to query Docker daemon",
                    CanStart: true);
            }
        }

        public async Task<SystemServiceCommandResult> StartAsync(string name)
        {
            if (!_nameMap.TryGetValue(name, out var containerName))
            {
                return new SystemServiceCommandResult(
                    Result: "Failed",
                    Message: $"Unknown service '{name}'");
            }

            try
            {
                await _client.Containers.StartContainerAsync(containerName, new ContainerStartParameters());
                return new SystemServiceCommandResult(
                    Result: "Started",
                    Message: $"Container '{containerName}' started.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting service {Service}", name);
                return new SystemServiceCommandResult(
                    Result: "Failed",
                    Message: $"Failed to start container '{containerName}': {ex.Message}");
            }
        }

        public async Task<SystemServiceCommandResult> RestartAsync(string name)
        {
            if (!_nameMap.TryGetValue(name, out var containerName))
            {
                return new SystemServiceCommandResult(
                    Result: "Failed",
                    Message: $"Unknown service '{name}'");
            }

            try
            {
                await _client.Containers.RestartContainerAsync(containerName, new ContainerRestartParameters
                {
                    WaitBeforeKillSeconds = 10
                });

                return new SystemServiceCommandResult(
                    Result: "Restarted",
                    Message: $"Container '{containerName}' restarted.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restarting service {Service}", name);
                return new SystemServiceCommandResult(
                    Result: "Failed",
                    Message: $"Failed to restart container '{containerName}': {ex.Message}");
            }
        }
    }
}
