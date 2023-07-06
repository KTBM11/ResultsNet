using Microsoft.EntityFrameworkCore;
using ResultsNet.Entities.Old;

namespace ResultsNet.Data
{
    public class OGContext : DbContext
    {
        public DbSet<OldCareer> career {get; set;}
        public DbSet<OldSeason> season {get; set;}
        public DbSet<OldCompetition> competition {get; set;}
        public DbSet<OldResult> result {get; set;}
        public DbSet<OldCompetitionFormat> competition_format {get; set;}
        private readonly ILogger<OGContext> _logger;

        public OGContext(ILogger<OGContext> logger)
        {
            _logger = logger;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            string connectionString = "server=localhost; port=3306; database=careermodedatabase; user=root; password=password";
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<OldCareer>(entity =>{
                entity.HasKey(c => c.career_id);
            }).Entity<OldSeason>(entity =>{
                entity.HasKey(s => s.season_id);
                entity.HasOne(s => s.oldCareer)
                .WithMany(c => c.oldSeasons)
                .HasForeignKey(s => s.career_id);
            }).Entity<OldCompetition>(entity =>{
                entity.HasKey(c => c.competition_id);
                entity.HasOne(c => c.oldSeason)
                .WithMany(c => c.oldCompetitions)
                .HasForeignKey(c => c.season_id);
            }).Entity<OldResult>(entity =>{
                entity.HasKey(r => r.result_id);
                entity.HasOne(r => r.oldCompetition)
                .WithMany(c => c.oldResults)
                .HasForeignKey(r => r.competition_id);
            }).Entity<OldCompetitionFormat>(entity => {
                entity.HasKey(cf => new {cf.name, cf.position});
            });
        }

        public async Task<OldData> getOldData(){
            OldData data = new OldData(); 
            List<OldCareer> careers =  await career.ToListAsync();
            var seasons = await season.ToListAsync();
            var comps = await competition.ToListAsync();
            var results = await result.ToListAsync();
            var cformats = await competition_format.ToListAsync();

            data.oldCareers = careers;
            data.oldSeasons = seasons;
            data.oldCompetitions = comps;
            data.oldResults = results;
            data.oldCompetitionFormats = cformats;
            return data;
        }
    }
}