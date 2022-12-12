using System.Text.RegularExpressions;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;

namespace ResultsNet.TransferObjects
{
    public class ResultTransfer : SuperTranfer
    {
        public Guid CompetitionId {get; set;}
        public int GoalsFor {get; set;}
        public int GoalsAgaints {get; set;}
        public string OppTeam {get; set;}
        public bool Home {get; set;}
        public bool Replay {get; set;}

        public Result ToResult(Guid user_id)
        {
            return new Result{
                ResultId = Guid.NewGuid(),
                user_id = user_id,
                CompetitionId = this.CompetitionId,
                GoalsFor = this.GoalsFor,
                GoalsAgaints = this.GoalsAgaints,
                OppTeam = this.OppTeam,
                Home = this.Home,
                Replay = this.Replay
            };
        }

        public override ErrorCollection GetClientErrors()
        {
            ErrorCollection collection = new ErrorCollection();
            ConfigModel config = Utility.sharedConfig;
            Regex? regex = Utility.getConfigRegex(config.season_teamname_expression);
            int? min = config.season_teamname_minlength;
            int? max = config.season_teamname_maxlength;
            if (GoalsFor < 0 || GoalsFor > 99)
                collection.AddError("result-goals-for", "Invalid score", "result_score_invalid");
            if (GoalsAgaints < 0 || GoalsAgaints > 100)
                collection.AddError("result-goals-againts", "Invalid score", "result_score_invalid");
            if (OppTeam.Length < min || OppTeam.Length > max)
                collection.AddError("result-opp-team", "Team name must be between {min} and {max} characters", "result_oppteam_incorrect_length");
            else if (regex != null && !regex.Match(OppTeam).Success)
                collection.AddError("result-opp-team", config.season_teamname_format_message, "result_oppteam_format_mismatch");
            
            return collection;
        }
    }
}