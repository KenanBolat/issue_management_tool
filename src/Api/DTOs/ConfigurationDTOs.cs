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
