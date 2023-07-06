using System.Text.RegularExpressions;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;

namespace ResultsNet.TransferObjects
{
    public class CompetitionFormatTransfer : SuperTranfer
    {
        public string Name {get; set;}
        public List<format> formats {get; set;}

        public class format 
        {
            public string Position {get; set;}
            public string Output {get; set;}

            public override string ToString()
            {
                return $"{{Position: \"{Position}\", Output: \"{Output}\"}}";
            }
        }

        public override ErrorCollection GetClientErrors()
        {
            ConfigModel config = Utility.sharedConfig;
            ErrorCollection collection = new ErrorCollection();
            Regex? nameRegex = Utility.getConfigRegex(config.competition_format_name_expression);
            Regex? posRegex = Utility.getConfigRegex(config.competition_format_position_expression);
            Regex? outRegex = Utility.getConfigRegex(config.competition_format_output_expression);
            if (Name.Length < config.competition_format_name_minlength || Name.Length > config.competition_format_name_maxlength)
            {
                collection.AddError("format_data_name", new Error($"Name must be between {config.competition_format_output_minlength} and {config.competition_format_name_maxlength} characters", "format_name_incorrect_length"));
            }
            if (nameRegex != null && !nameRegex.Match(Name).Success)
            {
                collection.AddError("format_data_name", new Error(config.competition_format_name_format_message, "format_name_format_mismatch"));
            }

            foreach (format format in formats)
            {
                string pos = format.Position;
                string output = format.Output;
                int? minP = config.competition_format_position_minlength;
                int? maxP = config.competition_format_position_maxlength;
                int? minO = config.competition_format_output_minlength;
                int? maxO = config.competition_format_output_maxlength;
                if (pos.Length < minP || pos.Length > maxP)
                    collection.AddError($"format_{pos}_{output}", $"Position must be between {minP} and {maxP} characters", "pos_incorrect_length");
                if (posRegex != null && !posRegex.Match(pos).Success)
                    collection.AddError($"format_{pos}_{output}", config.competition_format_position_format_message, "pos_format_mismatch");
                if (output.Length < minO || output.Length > maxO)
                    collection.AddError($"format_{pos}_{output}", $"Position must be between {minO} and {maxO} characters", "out_incorrect_length");
                if (outRegex != null && !outRegex.Match(pos).Success)
                    collection.AddError($"format_{pos}_{output}", config.competition_format_output_format_message, "out_format_mismatch");
            }
            return collection;
        }
    }

    public class CompetitionFormatTransferEdit : CompetitionFormatTransfer
    {
        public string ogName {get; set;}
    }
}