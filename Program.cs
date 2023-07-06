using ResultsNet.Data;
using ResultsNet.Repositories;
using ResultsNet.Custom;
using ResultsNet.Entities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>{
        //policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins(new string[]{"https://localhost:44427"});
        policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials(); //<--- Production
    });
});

builder.Services.AddDbContext<ResultsDBContext>(); //adds database
builder.Services.AddDbContext<OGContext>();
builder.Services.AddScoped<ResultsRepository>(); // adds class between controller and database
builder.Services.AddControllersWithViews(option =>{ // adds api controller
    option.SuppressAsyncSuffixInActionNames = false;
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    System.Console.WriteLine("This is not development");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
} else
    System.Console.WriteLine("This is development");

if (Environment.GetEnvironmentVariable("ASPNETCORE_USEHTTPSREDIRECTION") == "1")
    app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

//custom middleware
/*List<Func<HttpContext, RequestDelegate, Task>> customMiddleware = Customware2.getMiddleware();
for (int i = 0; i < customMiddleware.Count; i++)
{
    app.Use(customMiddleware[i]);
}*/
app.UseCustomware();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}");

app.MapFallbackToFile("index.html");

if (Utility.sharedConfig == null){
    throw new Exception("Could not load sharedConfig");
}
Utility.SetConfiguration(builder.Configuration);
Utility.SetLogger(builder.Services.BuildServiceProvider().GetRequiredService<ILogger<Program>>());
app.Run();
