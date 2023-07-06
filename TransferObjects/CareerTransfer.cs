using System.Text.RegularExpressions;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;

namespace ResultsNet.TransferObjects{
    public class CareerTransfer : SuperTranfer{
        public string Name {get; set;}

        public override ErrorCollection GetClientErrors()
        {
            ErrorCollection collection = new ErrorCollection();
            ConfigModel config = Utility.sharedConfig;
            Regex? careerNameRegex = Utility.getConfigRegex(config.career_name_expression);
            int? min = config.career_name_minlength;
            int? max = config.career_name_maxlength;
            if (Name.Length < min || Name.Length > max)
            {
                collection.AddError("add-career-name", $"Career name must be between {min} and {max} characters", "career_name_incorrect_length");
            }
            if (careerNameRegex != null && !careerNameRegex.Match(Name).Success)
            {
                collection.AddError("add-career-name", config.career_name_format_message, "career_name_format_mismatch");
            }
            return collection;
        }
    }

    public class CareerTransferEdit : CareerTransfer{
        public Guid CareerId {get; set;}
    }
}