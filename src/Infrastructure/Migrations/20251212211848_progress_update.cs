using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class progress_update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "progress_request_update",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    progress_request_id = table.Column<long>(type: "bigint", nullable: false),
                    updated_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    progress_info = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    progress_percentage = table.Column<int>(type: "integer", nullable: true),
                    estimated_completion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    notification_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_progress_request_update", x => x.id);
                    table.ForeignKey(
                        name: "FK_progress_request_update_Notifications_notification_id",
                        column: x => x.notification_id,
                        principalTable: "Notifications",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_progress_request_update_ProgressRequests_progress_request_id",
                        column: x => x.progress_request_id,
                        principalTable: "ProgressRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_progress_request_update_user_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_progress_request_update_notification_id",
                table: "progress_request_update",
                column: "notification_id");

            migrationBuilder.CreateIndex(
                name: "IX_progress_request_update_progress_request_id",
                table: "progress_request_update",
                column: "progress_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_progress_request_update_updated_by_user_id",
                table: "progress_request_update",
                column: "updated_by_user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "progress_request_update");
        }
    }
}
