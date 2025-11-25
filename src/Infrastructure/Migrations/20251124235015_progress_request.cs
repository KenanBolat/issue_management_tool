using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class progress_request : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProgressRequests",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ticket_id = table.Column<long>(type: "bigint", nullable: false),
                    requested_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    target_user_id = table.Column<long>(type: "bigint", nullable: false),
                    request_message = table.Column<string>(type: "text", nullable: true),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_responded = table.Column<bool>(type: "boolean", nullable: false),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    responded_by_user_id = table.Column<long>(type: "bigint", nullable: true),
                    response_action_id = table.Column<long>(type: "bigint", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    notification_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgressRequests_Notifications_notification_id",
                        column: x => x.notification_id,
                        principalTable: "Notifications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProgressRequests_TicketActions_response_action_id",
                        column: x => x.response_action_id,
                        principalTable: "TicketActions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProgressRequests_ticket_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "ticket",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProgressRequests_user_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgressRequests_user_responded_by_user_id",
                        column: x => x.responded_by_user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgressRequests_user_target_user_id",
                        column: x => x.target_user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_notification_id",
                table: "ProgressRequests",
                column: "notification_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_requested_by_user_id",
                table: "ProgressRequests",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_responded_by_user_id",
                table: "ProgressRequests",
                column: "responded_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_response_action_id",
                table: "ProgressRequests",
                column: "response_action_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_status",
                table: "ProgressRequests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_target_user_id",
                table: "ProgressRequests",
                column: "target_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressRequests_ticket_id",
                table: "ProgressRequests",
                column: "ticket_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProgressRequests");
        }
    }
}
