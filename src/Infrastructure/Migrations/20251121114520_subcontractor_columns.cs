using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class subcontractor_columns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "sub_contractor",
                table: "ticket",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "sub_contractor_notified_at",
                table: "ticket",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sub_contractor",
                table: "ticket");

            migrationBuilder.DropColumn(
                name: "sub_contractor_notified_at",
                table: "ticket");
        }
    }
}
