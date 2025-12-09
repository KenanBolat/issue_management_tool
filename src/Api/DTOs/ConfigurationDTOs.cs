namespace Api.DTOs;

public record ConfigurationResponse(
    long Id,
    DateTime? ExpirationDate,
    DateTime? PdfReportDate,
    bool IsActive,
    DateTime CreatedDate,
    DateTime UpdatedDate,
    string? UpdatedByName,
    string? ExcelDateTimeFormat,
    string? ExcelTimezone
);

public record UpdateConfigurationRequest(
    DateTime? ExpirationDate,
    DateTime? PdfReportDate,
    string? ExcelDateTimeFormat,
    string? ExcelTimezone
);

public record TimezoneInfo(string Id, string DisplayName, string Offset);

public record FormatPreviewRequest(string Format, string Timezone);

public record FormatPreviewResponse(bool IsValid, string? Example, string? Error);
