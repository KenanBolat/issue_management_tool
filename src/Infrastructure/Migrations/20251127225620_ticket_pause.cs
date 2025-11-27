using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ticket_pause : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ticket_pause",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ticket_id = table.Column<long>(type: "bigint", nullable: false),
                    paused_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    paused_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    resumed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resumed_by_user_id = table.Column<long>(type: "bigint", nullable: true),
                    pause_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    resume_notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_pause", x => x.id);
                    table.ForeignKey(
                        name: "FK_ticket_pause_ticket_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "ticket",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ticket_pause_user_paused_by_user_id",
                        column: x => x.paused_by_user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ticket_pause_user_resumed_by_user_id",
                        column: x => x.resumed_by_user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ticket_pause_paused_at",
                table: "ticket_pause",
                column: "paused_at");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_pause_paused_by_user_id",
                table: "ticket_pause",
                column: "paused_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_pause_resumed_by_user_id",
                table: "ticket_pause",
                column: "resumed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_pause_ticket_id",
                table: "ticket_pause",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_pause_ticket_id_resumed_at",
                table: "ticket_pause",
                columns: new[] { "ticket_id", "resumed_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ticket_pause");
        }
    }
}
