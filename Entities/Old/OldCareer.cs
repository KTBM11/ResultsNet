using System.Text.Json.Serialization;

namespace ResultsNet.Entities.Old
{
    public class OldCareer
    {
        public int career_id {get; set;}
        public string name {get; set;}
        public int? selected_season {get; set;}
        [JsonIgnore]
        public List<OldSeason> oldSeasons {get; set;}

        public Career ToNewCareer(Guid user_id, DateTime? time)
        {
            if (time == null)
                time = DateTime.UtcNow;
            return new Career
            {
                CareerId = Guid.NewGuid(),
                Name = this.name.Substring(0, Math.Min(this.name.Length, 32)),
                user_id = user_id,
                Created = (DateTime) time,
            };
        }
    }
}