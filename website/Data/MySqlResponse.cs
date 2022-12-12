using ResultsNet.ApiResponse;
using ResultsNet.Entities;

namespace ResultsNet.Data;

public class MySqlResponse
{
    public bool success {get; set;} = false;
    public ErrorCollection errorCollection {get; set;} = new ErrorCollection();
    public string ErrorCode {get; set;} = "";
    public string Msg {get; set;} = "";
    public Guid? requestUserId {get; set;}
    public string? requestUsername {get; set;}

    public User? requestUser {get; set;}

    public void fromOtherResponse (MySqlResponse response)
    {
        success = response.success;
        ErrorCode = response.ErrorCode;
        Msg = response.Msg;
        errorCollection = response.errorCollection;
    }

    public void doFailure(string inputId, string msg, string code)
    {
        success = false;
        Msg = msg;
        ErrorCode = code;
        errorCollection.AddError(inputId, msg, code);
    }

    public void defaultError()
    {
        success = false;
        Msg = "An error has occured";
        ErrorCode = "error_unkown";
        errorCollection.AddError("global", Msg, ErrorCode);
    }
}

public class MySqlInsertResponse : MySqlResponse
{
    public Guid? InsertId {get; set;}
    public DateTime? InsertTime {get; set;}
}

public class MySqlFetchResponse<T> : MySqlResponse
{
    public bool requestUserMatchesTarget {get; set;} = false; // is the requesting user the same as target user they are fetching data from
    public T? entity {get; set;}

}