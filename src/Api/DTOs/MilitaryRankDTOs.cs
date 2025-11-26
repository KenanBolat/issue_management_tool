namespace Api.DTOs
{
    public record MilitaryRankListItem(
        int Id,
        string Code,
        string DisplayName,
        string? Description,
        int SortOrder
    );

    public record MilitaryRankDetail(
        int Id,
        string Code,
        string DisplayName,
        string? Description,
        int SortOrder    );

    public record CreateMilitaryRankRequest(
        string Code,
        string DisplayName,
        string? Description,
        int? SortOrder
    );

    public record UpdateMilitaryRankRequest(
        string? Code,
        string? DisplayName,
        string? Description,
        int? SortOrder
    );
}