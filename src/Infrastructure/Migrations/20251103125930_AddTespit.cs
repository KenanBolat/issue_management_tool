using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTespit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:activity_check_result", "pending,approved,rejected,needs_revision")
                .Annotation("Npgsql:Enum:notification_method", "email,telephone,briefing,verbal");

            migrationBuilder.AddColumn<DateTime>(
                name: "DetectionContractorNotifiedAt",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DetectionDetectedByUserId",
                table: "Tickets",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int[]>(
                name: "DetectionNotificationMethods",
                table: "Tickets",
                type: "integer[]",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "detection_data",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "response_date",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "response_resolved_at",
                table: "Tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ticket_response_personnel",
                columns: table => new
                {
                    ticket_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_response_personnel", x => new { x.ticket_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_ticket_response_personnel_Tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ticket_response_personnel_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_DetectionDetectedByUserId",
                table: "Tickets",
                column: "DetectionDetectedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_response_personnel_user_id",
                table: "ticket_response_personnel",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_ticket_detection_detected_by_user",
                table: "Tickets",
                column: "DetectionDetectedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_ticket_detection_detected_by_user",
                table: "Tickets");

            migrationBuilder.DropTable(
                name: "ticket_response_personnel");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_DetectionDetectedByUserId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DetectionContractorNotifiedAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DetectionDetectedByUserId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DetectionNotificationMethods",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "detection_data",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "response_date",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "response_resolved_at",
                table: "Tickets");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:Enum:activity_check_result", "pending,approved,rejected,needs_revision")
                .OldAnnotation("Npgsql:Enum:notification_method", "email,telephone,briefing,verbal");
        }
    }
}
