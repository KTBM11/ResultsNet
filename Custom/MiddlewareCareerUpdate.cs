using Microsoft.EntityFrameworkCore;
using ResultsNet.ApiResponse;

namespace ResultsNet.Custom
{
    public class MiddlewareCareerUpdate : Customware
    {
        public MiddlewareCareerUpdate(RequestDelegate next, ILoggerFactory logFactory) : base(next, logFactory)
        {
        }

        public override void Initialize()
        {
            _logger.CLogInfo("MiddlewareCareerUpdate has been instantiated");
        }

        public override async Task Invoke(HttpContext context)
        {
            _logger.CLogDebug("MiddlewareCareerUpdate is currently executing");
            ResultResponse baseResponse = (ResultResponse) context.Items["resultresponse"];
            Guid? user_id = (Guid?) context.Items["user_id"];
            if (user_id==null)
            {
                //await context.Response.WriteAsync("No Token");
                baseResponse.message = "Invalid Token";
                baseResponse.AddError("You must be logged in to perform this action", "token_invalid");
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(baseResponse);
                return;
            }
            await _next(context);
        }
    }
}