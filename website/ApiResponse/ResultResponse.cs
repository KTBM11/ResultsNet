using ResultsNet.Data;

namespace ResultsNet.ApiResponse{
    public class ResultResponse{ // class for sending response back to user, some stuff probably only for development purposes
        public ResultOutcome outcome {get; set;} = ResultOutcome.FAILURE;
        public string message {get; set;} = "";
        public List<Error> errors {get; set;} = new List<Error>();
        public ErrorCollection errorCollection {get; set;} = new ErrorCollection();
        public string redirect {get; set;} = "";
        public object obj {get; set;} // mostly for dev purposes so I can use any object/entity
        public string? verfiedUsername {get; set;}
        public bool valid_token {get; set;} = false;

        public ResultResponse(){

        }
        public ResultResponse(ResultResponse r)
        {
            this.outcome = r.outcome;
            this.message = r.message;
            this.errors = r.errors;
            this.redirect = r.redirect;
            this.obj = r.obj;
            this.verfiedUsername = r.verfiedUsername;
            this.valid_token = r.valid_token;
        }

        public void AddError(string msg, string code)
        {
            errors.Add(new Error(msg, code));
        }

        public void AddErrors(List<Error> errors)
        {
            errors.AddRange(errors);
        }

        public void fromQueryResponse (MySqlResponse queryResponse)
        {
            message = queryResponse.Msg;
            outcome = queryResponse.success ? ResultOutcome.SUCCESS : ResultOutcome.FAILURE;
            verfiedUsername = queryResponse.requestUsername;
            errorCollection = queryResponse.errorCollection;
            if (!queryResponse.success)
                AddError(queryResponse.Msg, queryResponse.ErrorCode);
        }
    }

    public class Error
    {
        public string msg {get; set;}
        public string code {get; set;}

        public Error(string msg, string code)
        {
            this.msg = msg;
            this.code = code;
        }

        public override string ToString()
        {
            return $"{{msg: \"{msg}\", code: \"{code}\"}}";
        }
    }

    public class ErrorCollection
    {   
        // string (inputId), Error
        public Dictionary<string, List<Error>> errors {get; set;} = new Dictionary<string, List<Error>>();
        
        public ErrorCollection()
        {

        }

        public void AddError(string inputId, Error error)
        {
            List<Error> newErrors = new List<Error>{error};
            if (errors.ContainsKey(inputId)){
                errors[inputId].AddRange(newErrors);
                return;
            }
            errors.Add(inputId, newErrors);
        }

        public void AddError(string inputId, string msg, string code)
        {
            this.AddError(inputId, new Error(msg, code));
        }

        public bool hasErrors()
        {
            foreach (KeyValuePair<string, List<Error>> kvp in errors)
            {
                if (kvp.Value.Count > 0)
                    return true;
            }
            return false;
        }
    }

    public enum ResultOutcome: byte{
        FAILURE,
        SUCCESS,
        INVALID_TOKEN
    }
}