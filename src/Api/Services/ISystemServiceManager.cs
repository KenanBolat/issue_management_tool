namespace Api.Services
{
    // Internal status used by SystemController to build DTOs
    public record SystemServiceStatus(
        string Status,        // "Running", "Stopped", "Error"
        string Description,
        bool CanStart         // whether UI may try to start it
    );

    public record SystemServiceCommandResult(
        string Result,        // "Started", "Restarted", "Failed"
        string Message
    );

    public interface ISystemServiceManager
    {
        Task<SystemServiceStatus> GetStatusAsync(string name);           // "db", "redis", "backup"
        Task<SystemServiceCommandResult> StartAsync(string name);        // start container/service
        Task<SystemServiceCommandResult> RestartAsync(string name);      // restart container/service
    }
}
