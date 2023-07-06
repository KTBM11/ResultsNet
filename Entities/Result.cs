using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using ResultsNet.Custom;

namespace ResultsNet.Entities{
    public class Result{
        public Guid ResultId {get; set;}
        //type
        [Column(TypeName="tinyint(255)")]
        public int Position {get; set;}
        [Column(TypeName="tinyint(255)")]
        public int GoalsFor {get; set;}
        [Column(TypeName="tinyint(255)")]
        public int GoalsAgaints {get; set;}
        public string OppTeam {get; set;}
        public bool Home {get; set;}
        public bool Replay {get; set;}
        public DateTime Created {get; set;}
        public Guid CompetitionId {get; set;}
        [JsonIgnore]
        public Competition competition {get; set;}
        public Guid user_id {get; set;}
        /*[JsonIgnore]
        public User user {get; set;}*/

        public override string ToString()
        {
            return $"{{ResultId: \"{ResultId.ToString()}\", Position: {Position}, GoalsFor: {GoalsFor}, GoalsAgaints: {GoalsAgaints}, OppTeam: \"{OppTeam}\", Home: {Home}" +
            $", Replay: {Replay}, CompetitionId: \"{CompetitionId.ToString()}\", user_id: \"{user_id.ToString()}\"}}";
        }

        public static Result Random (Competition competition, int pos)
        {
            Result result = new Result();
            result.ResultId = Guid.NewGuid();
            result.Position = pos;
            result.GoalsFor = Utility.random.Next(7);
            result.GoalsAgaints = Utility.random.Next(6);
            while (true)
            {
                string oppTeam = RandomEntities.TeamNames.GetRandom();
                if (!oppTeam.Equals(competition.season.TeamName))
                {
                    result.OppTeam = oppTeam;
                    break;
                }
            }
            result.Home = Utility.random.Next(2) == 1 ? true : false;
            result.Replay = false;
            result.CompetitionId = competition.CompetitionId;
            result.competition = competition;
            result.user_id = competition.user_id;
            //result.user = competition.user;
            return result;
        }
    }
}