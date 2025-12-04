namespace Api.DTOs;

public record ServiceHealthItem(
    string Name,          // "db", "redis", "backup"
    string Status,        // "Running", "Stopped", "Error"
    string Description,
    bool CanStart         // true => we can try to start from UI
);

public record ServiceCommandResponse(
    string Name,
    string Result,        // "Started", "Restarted", "Flushed", "Failed"
    string Message
);

