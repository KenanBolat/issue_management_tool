using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProgressRequestUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "progressRequestUpdates",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProgressRequestId = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedById = table.Column<long>(type: "bigint", nullable: false),
                    ProgressInfo = table.Column<string>(type: "text", nullable: true),
                    ProgressPercentage = table.Column<int>(type: "integer", nullable: true),
                    EstimatedCompletion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotificationId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_progressRequestUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_progressRequestUpdates_Notifications_NotificationId",
                        column: x => x.NotificationId,
                        principalTable: "Notifications",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_progressRequestUpdates_ProgressRequests_ProgressRequestId",
                        column: x => x.ProgressRequestId,
                        principalTable: "ProgressRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_progressRequestUpdates_user_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_progressRequestUpdates_NotificationId",
                table: "progressRequestUpdates",
                column: "NotificationId");

            migrationBuilder.CreateIndex(
                name: "IX_progressRequestUpdates_ProgressRequestId",
                table: "progressRequestUpdates",
                column: "ProgressRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_progressRequestUpdates_UpdatedById",
                table: "progressRequestUpdates",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "progressRequestUpdates");
        }
    }
}
