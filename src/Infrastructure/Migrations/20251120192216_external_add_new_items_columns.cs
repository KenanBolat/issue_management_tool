using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class external_add_new_items_columns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "hp_no",
                table: "ticket",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "new_item_description",
                table: "ticket",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "new_item_id",
                table: "ticket",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "new_item_serial_no",
                table: "ticket",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "tentative_solution_date",
                table: "ticket",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hp_no",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "new_item_description",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "new_item_id",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "new_item_serial_no",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "tentative_solution_date",
                table: "ticket");
        }
    }
}
