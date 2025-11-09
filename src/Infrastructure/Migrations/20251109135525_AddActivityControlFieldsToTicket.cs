using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityControlFieldsToTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "activity_control_commander_id",
                table: "ticket",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "activity_control_date",
                table: "ticket",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "activity_control_personnel_id",
                table: "ticket",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "activity_control_result",
                table: "ticket",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ticket_activity_control_commander_id",
                table: "ticket",
                column: "activity_control_commander_id");

            migrationBuilder.CreateIndex(
                name: "IX_ticket_activity_control_personnel_id",
                table: "ticket",
                column: "activity_control_personnel_id");

            migrationBuilder.AddForeignKey(
                name: "FK_ticket_user_activity_control_commander_id",
                table: "ticket",
                column: "activity_control_commander_id",
                principalTable: "user",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ticket_user_activity_control_personnel_id",
                table: "ticket",
                column: "activity_control_personnel_id",
                principalTable: "user",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ticket_user_activity_control_commander_id",
                table: "ticket");

            migrationBuilder.DropForeignKey(
                name: "FK_ticket_user_activity_control_personnel_id",
                table: "ticket");

            migrationBuilder.DropIndex(
                name: "IX_ticket_activity_control_commander_id",
                table: "ticket");

            migrationBuilder.DropIndex(
                name: "IX_ticket_activity_control_personnel_id",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "activity_control_commander_id",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "activity_control_date",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "activity_control_personnel_id",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "activity_control_result",
                table: "ticket");
        }
    }
}
