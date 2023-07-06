using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResultsNet.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "user",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Username = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Password = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<byte[]>(type: "blob(64)", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "blob(128)", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "(now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user", x => x.user_id);
                    table.UniqueConstraint("AK_user_Username", x => x.Username);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "career",
                columns: table => new
                {
                    CareerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Created = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "(now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_career", x => new { x.user_id, x.CareerId });
                    table.ForeignKey(
                        name: "FK_career_user_user_id",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "competition_format",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Position = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Output = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_competition_format", x => new { x.user_id, x.Name, x.Position });
                    table.ForeignKey(
                        name: "FK_competition_format_user_user_id",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "season",
                columns: table => new
                {
                    SeasonId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TeamName = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CareerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Created = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "(now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_season", x => new { x.user_id, x.SeasonId });
                    table.ForeignKey(
                        name: "FK_season_career_user_id_CareerId",
                        columns: x => new { x.user_id, x.CareerId },
                        principalTable: "career",
                        principalColumns: new[] { "user_id", "CareerId" },
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "competition",
                columns: table => new
                {
                    CompetitionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FormatName = table.Column<string>(type: "varchar(32)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SeasonId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StartAt = table.Column<int>(type: "int", nullable: true),
                    Concluded = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Minimized = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "(now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_competition", x => new { x.user_id, x.CompetitionId });
                    table.ForeignKey(
                        name: "FK_competition_season_user_id_SeasonId",
                        columns: x => new { x.user_id, x.SeasonId },
                        principalTable: "season",
                        principalColumns: new[] { "user_id", "SeasonId" },
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "result",
                columns: table => new
                {
                    ResultId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Position = table.Column<sbyte>(type: "tinyint(255)", nullable: false),
                    GoalsFor = table.Column<sbyte>(type: "tinyint(255)", nullable: false),
                    GoalsAgaints = table.Column<sbyte>(type: "tinyint(255)", nullable: false),
                    OppTeam = table.Column<string>(type: "varchar(32)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Home = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Replay = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "(now())"),
                    CompetitionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_result", x => new { x.user_id, x.ResultId });
                    table.ForeignKey(
                        name: "FK_result_competition_user_id_CompetitionId",
                        columns: x => new { x.user_id, x.CompetitionId },
                        principalTable: "competition",
                        principalColumns: new[] { "user_id", "CompetitionId" },
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_competition_user_id_SeasonId",
                table: "competition",
                columns: new[] { "user_id", "SeasonId" });

            migrationBuilder.CreateIndex(
                name: "IX_result_user_id_CompetitionId",
                table: "result",
                columns: new[] { "user_id", "CompetitionId" });

            migrationBuilder.CreateIndex(
                name: "IX_season_user_id_CareerId",
                table: "season",
                columns: new[] { "user_id", "CareerId" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "competition_format");

            migrationBuilder.DropTable(
                name: "result");

            migrationBuilder.DropTable(
                name: "competition");

            migrationBuilder.DropTable(
                name: "season");

            migrationBuilder.DropTable(
                name: "career");

            migrationBuilder.DropTable(
                name: "user");
        }
    }
}
