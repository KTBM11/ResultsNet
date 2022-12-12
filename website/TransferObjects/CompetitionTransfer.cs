using System.Text.RegularExpressions;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;

namespace ResultsNet.TransferObjects{
    public class CompetitionTransfer : SuperTranfer
    {
        public string Name {get; set;}
        public string? FormatName {get; set;}
        public int StartAt {get; set;}
        public Guid SeasonId {get; set;}

        public Competition ToCompetition(Guid _user_id)
        {
            return new Competition
            {
                CompetitionId = Guid.NewGuid(),
                Name = this.Name,
                FormatName = this.FormatName,
                StartAt = this.StartAt,
                Concluded = false,
                Minimized = false,
                user_id = _user_id,
                SeasonId = this.SeasonId
            };
        }

        public override ErrorCollection GetClientErrors()
        {
            ErrorCollection collection = new ErrorCollection();
            ConfigModel config = Utility.sharedConfig;
            Regex? nameRegex = Utility.getConfigRegex(config.competition_name_expression);
            int? min = config.competition_name_minlength;
            int? max = config.competition_name_maxlength;
            if (Name.Length < min || Name.Length > max)
                collection.AddError("add-comp-name", $"Competition name must be between {min} and {max} characters", "competition_name_incorrect_length");
            if (nameRegex != null && !nameRegex.Match(Name).Success)
                collection.AddError("add-comp-name", config.competition_name_format_message, "competition_name_format_mismatch");
            if (StartAt < 1 || StartAt > 100)
                collection.AddError("add-comp-startat", "Must be a number between 1 and 100", "competition_startat_invalid");
            return collection;
        }   
    }

    public class CompetitionTransferEdit: CompetitionTransfer{
        public Guid CompetitionId {get; set;}
        public bool Concluded {get; set;}
        public bool Minimized {get; set;}
    }
}