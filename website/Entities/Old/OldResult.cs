using System.Text.Json.Serialization;

namespace ResultsNet.Entities.Old
{
    public class OldResult
    {
        [JsonIgnore]
        public OldCompetition oldCompetition {get; set;}
        public int result_id {get; set;}
        public int position {get; set;}
        public int goals_f {get; set;}
        public int goals_a {get; set;}
        public string opp_team {get; set;}
        public bool is_home {get; set;}
        public int competition_id {get; set;}
        public bool? is_replay {get; set;}

        public Result ToNewResult(Guid user_id, Guid CompetitionId)
        {
            return new Result
            {
                ResultId = Guid.NewGuid(),
                Position = position,
                GoalsFor = goals_f,
                GoalsAgaints = goals_a,
                OppTeam =  opp_team,
                Home = is_home,
                Replay = (bool) is_replay,
                CompetitionId = CompetitionId,
                user_id = user_id,
            };
        }
    }
}