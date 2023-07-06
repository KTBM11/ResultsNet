using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResultsNet.Migrations
{
    public partial class _AddPublicAccountProperty : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PublicAccount",
                table: "user",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicAccount",
                table: "user");
        }
    }
}
