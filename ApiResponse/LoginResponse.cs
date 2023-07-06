using ResultsNet.Entities;

namespace ResultsNet.ApiResponse
{
    public class LoginResponse : ResultResponse
    {
        public string access_token {get; set;}

        public LoginResponse(){

        }


        public LoginResponse(ResultResponse r) : base(r)
        {
        }
    }
}