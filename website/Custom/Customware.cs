using Microsoft.EntityFrameworkCore;
using ResultsNet.ApiResponse;
using ResultsNet.Data;
using ResultsNet.TransferObjects;
using System.Text;
using System.Text.Json;

namespace ResultsNet.Custom
{
    public class Customware
    {
        protected readonly RequestDelegate _next;
        protected readonly ILogger _logger;


        public virtual void Initialize(){
            _logger.CLogInfo("Customware has been instantiated");
        }

        public Customware(RequestDelegate next, ILoggerFactory logFactory)
        {
            _next = next;
            _logger = logFactory.CreateLogger("Customware");
            this.Initialize();
        }

        private void initItems(IDictionary<object, object?> items) // mostly just to see which item assignments I use
        {
            items["user_id"] = null;
            items["username"] = null;
            items["resultresponse"] = new ResultResponse();
        }

        private void authorization(IDictionary<object, object?> items, string token)
        {
            ResultResponse response = (ResultResponse) items["resultresponse"];
            UserTransfer? user = Utility.ValidateToken(token);
            Guid? user_id = (user != null) ? user.user_id : null;
            string username = (user != null) ? user.Username : null;
            items["user_id"] = user_id;
            items["username"] = username;
            if (user_id != null)
            {
                response.valid_token = true;
            }
        }

        private async Task<bool> CanConnectToDatabase(IDictionary<object, object?> items, DbContext dbContext)
        {
            ResultResponse response = (ResultResponse) items["resultresponse"];
            try
            {
                if (await dbContext.Database.CanConnectAsync())
                {
                    return true;
                }
            } catch (Exception e)
            {
                response.errorCollection.AddError("global", "Internal systems are down", "error_db_noconnection");
            }
            return false;
        }

        public virtual async Task Invoke(HttpContext context)
        {
            _logger.CLogDebug("Customware is currently executing");
            _logger.CLogDebug(context.Request.Path.ToString());
            var dbContext = context.RequestServices.GetRequiredService<ResultsDBContext>();
            string body = await BodyAsString(context.Request);
            IDictionary<object, object?> items = context.Items;
            string? access_token = context.Request.Cookies["results_net_token"];
            if (access_token == null)
                _logger.CLogDebug("NULL TOKEN");
            else
                _logger.CLogDebug(access_token);
            initItems(items);
            //string access_token = context.Request.Headers["Authorization"];
            bool canConnect = await CanConnectToDatabase(items, dbContext);
            if (!canConnect){
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(items["resultresponse"]);
                return;
            }
            authorization(items, access_token);
            string requestUsername = items["username"] == null ? "anonymous" : (string) items["username"];
            if (body.Length > 0)
                _logger.CLogDebug($"{context.Request.Path} has been called by user '{requestUsername}' ({items["user_id"]}) with the following data:\n{body}\n");
            await _next(context);
        }

        private async Task<string> BodyAsString(HttpRequest request)
        {
            request.EnableBuffering();
            StreamReader reader = new StreamReader(request.Body);
            string body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            return body;
        }

    }
}