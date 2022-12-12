using System.Text.Json.Serialization;

namespace ResultsNet.Entities.Old
{
    public class OldCompetition
    {
        [JsonIgnore]
        public OldSeason oldSeason {get; set;}
        public int competition_id {get; set;}
        public string name {get; set;}
        public string format_name {get; set;}
        public int? start_at {get; set;}
        public bool concluded {get; set;}
        public bool Minimized {get; set;}
        public int season_id {get; set;}
        [JsonIgnore]
        public List<OldResult> oldResults {get; set;}

        public Competition ToNewCompetition(Guid user_id, Guid SeasonId, DateTime? time)
        {
            if (time == null)
                time = DateTime.UtcNow;
            return new Competition
            {
                CompetitionId = Guid.NewGuid(),
                Name = this.name,
                FormatName = this.format_name,
                StartAt = this.start_at,
                Concluded = this.concluded,
                Minimized = this.Minimized,
                SeasonId = SeasonId,
                user_id = user_id,
                Created = (DateTime) time,
            };
        }
    }
}