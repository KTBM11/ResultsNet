using System.Text.RegularExpressions;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;

namespace ResultsNet.TransferObjects
{
    public class SeasonTransfer : SuperTranfer
    {
        public string Name {get; set;}
        public string TeamName {get; set;}

        public override ErrorCollection GetClientErrors()
        {
            ErrorCollection collection = new ErrorCollection();
            ConfigModel config = Utility.sharedConfig;
            Regex? nameRegex = Utility.getConfigRegex(config.season_name_expression);
            Regex? teamRegex = Utility.getConfigRegex(config.season_teamname_expression);
            int? nameMin = config.season_name_minlength;
            int? nameMax = config.season_name_maxlength;
            int? teamMin = config.season_teamname_minlength;
            int? teamMax = config.season_teamname_maxlength;

            if (Name.Length < nameMin || Name.Length > nameMax)
            {
                collection.AddError("add-season-name", $"Season name must be between {nameMin} and {nameMax} characters", "season_name_incorrect_length");
            }
            if (nameRegex != null && !nameRegex.Match(Name).Success)
            {
                collection.AddError("add-season-name", config.season_name_format_message, "season_name_format_mismatch");
            }
            if (TeamName.Length < teamMin || TeamName.Length > teamMax)
            {
                collection.AddError("add-season-team-name", $"Team name must be between {teamMin} and {teamMax} characters", "team_name_incorrect_length");
            }
            if ((teamRegex != null && !teamRegex.Match(TeamName).Success))
            {
                collection.AddError("add-season-team-name", config.season_teamname_format_message, "team_name_format_mismatch");
            }
            return collection;
        }
    }

    public class SeasonTransferEdit : SeasonTransfer
    {
        public Guid SeasonId {get; set;}
    }
}