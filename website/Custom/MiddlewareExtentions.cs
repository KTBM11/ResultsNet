namespace ResultsNet.Custom
{
    public static class MiddlewareExtentions
    {
        public static IApplicationBuilder UseCustomware(this IApplicationBuilder builder)
        {
            builder.UseWhen(context => context.Request.Path.StartsWithSegments("/api"), appBuilder =>{
               appBuilder.UseMiddleware<Customware>(); 
            });
            builder.UseWhen(context => context.Request.Path.StartsWithSegments("/api/results/update"), appBuilder =>{
                appBuilder.UseMiddleware<MiddlewareCareerUpdate>();
            });
            return builder;
        }

        public static void InstantDenyNoToken(IApplicationBuilder builder){
            builder.Run(async (context) =>{
                Console.WriteLine("Sidemen Gaming");
                Console.WriteLine(context.Items["user_id"]);
                //await next(context);  
            });
        }
    }
}