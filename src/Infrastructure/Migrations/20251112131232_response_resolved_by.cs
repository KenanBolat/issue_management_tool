using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class response_resolved_by : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "response_resolved_by_user_id",
                table: "ticket",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ticket_response_resolved_personnel",
                columns: table => new
                {
                    ticket_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_response_resolved_personnel", x => new { x.ticket_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_ticket_response_resolved_personnel_ticket_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "ticket",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ticket_response_resolved_personnel_user_user_id",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ticket_response_resolved_personnel_user_id",
                table: "ticket_response_resolved_personnel",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ticket_response_resolved_personnel");

            migrationBuilder.DropColumn(
                name: "response_resolved_by_user_id",
                table: "ticket");
        }
    }
}
