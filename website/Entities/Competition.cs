using System.Text.Json.Serialization;
using ResultsNet.Custom;

namespace ResultsNet.Entities{
    public class Competition{
        public Guid CompetitionId {get; set;}
        public string Name {get; set;}
        public string? FormatName {get; set;}
        public Guid SeasonId {get; set;}
        public int? StartAt {get; set;}
        public bool Concluded {get; set;}
        public bool Minimized {get; set;}
        public DateTime Created {get; set;}
        [JsonIgnore]
        public Season season {get; set;}
        [JsonIgnore]
        public List<Result> results {get; set;} = new List<Result>();
        public Guid user_id {get; set;}
        /*[JsonIgnore]
        public User user {get; set;}*/

        public override string ToString()
        {
            return $"{{CompetitionId: \"{CompetitionId.ToString()}\", Name: \"{Name}\", FormatName: \"{(FormatName != null ? FormatName : "null")}\", SeasonId: \"{SeasonId.ToString()}\"" +
            $", StartAt: {(StartAt != null ? StartAt : "null")}, Concluded: {Concluded}, Minimized: {Minimized}, user_id: \"{user_id.ToString()}\", results: {results.AsArrayString()}}}";
        }

        public static Competition Random(Season season, string name)
        {
            Competition competition = new Competition();
            competition.CompetitionId = Guid.NewGuid();
            competition.Name = name;
            competition.SeasonId = season.SeasonId;
            competition.StartAt = 1;
            competition.Concluded = Utility.random.Next(2) == 1 ? true : false;
            competition.Minimized = Utility.random.Next(2) == 1 ? true : false;
            competition.season = season;
            competition.user_id = season.user_id;
            //competition.user = season.user;
            for (int i = 0; i < Utility.random.Next(15); i++){
                competition.results.Add(Result.Random(competition, i+1));
            }
            return competition;
        }
    }
}