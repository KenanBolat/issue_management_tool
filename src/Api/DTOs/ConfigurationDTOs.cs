namespace Api.DTOs;

public record ConfigurationResponse(
    long Id,
    DateTime? ExpirationDate,
    DateTime PdfReportDate,
    bool IsActive,
    DateTime CreatedDate,
    DateTime UpdatedDate,
    string? UpdatedByName
);


public record UpdateConfigurationRequest(
    DateTime? ExpirationDate,
    DateTime PdfReportDate
);