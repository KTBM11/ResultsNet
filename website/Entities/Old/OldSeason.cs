using System.Text.Json.Serialization;

namespace ResultsNet.Entities.Old
{
    public class OldSeason
    {
        [JsonIgnore]
        public OldCareer oldCareer {get; set;}
        public int season_id {get; set;}
        public string name {get; set;}
        public string selected_team {get; set;}
        public int career_id {get; set;}
        [JsonIgnore]
        public List<OldCompetition> oldCompetitions {get; set;}
        public Season ToNewSeason(Guid user_id, Guid CareerId, DateTime? time)
        {
            if (time == null)
                time = DateTime.UtcNow;
            return new Season
            {
                SeasonId = Guid.NewGuid(),
                Name = this.name,
                TeamName = this.selected_team,
                CareerId = CareerId,
                Created = (DateTime) time,
                user_id = user_id,
            };
        }
    }
}