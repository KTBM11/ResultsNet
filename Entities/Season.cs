using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using ResultsNet.Custom;

namespace ResultsNet.Entities{
    public class Season{
        public Guid SeasonId {get; set;}
        public string Name {get; set;}
        public string TeamName {get; set;}
        public Guid CareerId {get; set;}
        public DateTime Created {get; set;}
        [JsonIgnore]
        public Career career {get; set;}
        [JsonIgnore]
        public List<Competition> competitions {get; set;} = new List<Competition>();
        public Guid user_id {get; set;}
        /*[JsonIgnore]
        public User user {get; set;}*/

        public override string ToString()
        {
            return $"{{SeasonId: \"{SeasonId.ToString()}\", Name: \"{Name}\", TeamName: \"{TeamName}\", CareerId: \"{CareerId.ToString()}\", user_id: \"{user_id.ToString()}\","
            + $" competitions: {competitions.AsArrayString()}}}";
        }

        public static Season Random(Career career, int seasonNumber = 0, string teamName = "Liverpool")
        {
            Season season = new Season();
            season.SeasonId = Guid.NewGuid();
            season.Name = RandomEntities.SeasonNames[seasonNumber];
            season.TeamName = teamName;
            season.CareerId = career.CareerId;
            season.career = career;
            season.user_id = career.user_id;
            //season.user = career.user;
            for (int i = 0; i < Utility.random.Next(4); i++)
            {
                season.competitions.Add(Competition.Random(season, RandomEntities.CompetitionNames[i]));
            }
            return season;
        }
    }
}