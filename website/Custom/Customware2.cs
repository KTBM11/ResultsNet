using ResultsNet.ApiResponse;
using ResultsNet.TransferObjects;

namespace ResultsNet.Custom
{
    public static class Customware2
    {
        public static async Task GroundWork(HttpContext context, RequestDelegate next)
        {
            context.Items["user_id"] = null;
            context.Items["username"] = null;
            context.Items["resultresponse"] = new ResultResponse();
            await next(context);
        }
        public static async Task TestMiddleware(HttpContext context, RequestDelegate next)
        {
            Console.WriteLine("Custom middleware has been used lol");
            //await context.Response.WriteAsync("Hello World From 1st Middleware!");
            context.Items["testitem"] = "this is a test custom middlewhere item";
            await next(context);
        }

        public static async Task SetUser(HttpContext context, RequestDelegate next)
        {
            ResultResponse? response = (ResultResponse) context.Items["resultresponse"];
            string access_token = context.Request.Headers["Authorization"];
            UserTransfer? user = Utility.ValidateToken(access_token);
            Guid? user_id = (user != null) ? user.user_id : null;
            string username = (user != null) ? user.Username : null;
            context.Items["user_id"] = user_id;
            context.Items["username"] = username;
            await next(context);
        }

        public static List<Func<HttpContext, RequestDelegate, Task>> getMiddleware()
        {
            List<Func<HttpContext, RequestDelegate, Task>> middleware = new List<Func<HttpContext, RequestDelegate, Task>>{
                GroundWork,
                TestMiddleware,
                SetUser,
            };
            /*middleware.Add(GroundWork);
            middleware.Add(TestMiddleware);
            middleware.Add(SetUser);*/
            return middleware;
        }

    }
}