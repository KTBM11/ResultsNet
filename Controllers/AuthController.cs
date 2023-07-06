using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;
using ResultsNet.Repositories;
using ResultsNet.TransferObjects;

namespace ResultsNet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly ResultsRepository repository;
        private readonly IConfiguration configuration;
        public AuthController(ILogger<AuthController> logger, ResultsRepository resultsRepository, IConfiguration configuration)
        {
            _logger = logger;
            repository = resultsRepository;
            this.configuration = configuration;
            _logger.CLogInfo("Auth controller loaded");
        }

        [HttpGet("alive")]
        public IActionResult Alive()
        {
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            _logger.CLogInfo($"/alive has been requested in the Auth controller from user = {(user_id != null ? user_id : "anonymous")}");
            //return Ok("The Auth controller is alive and ready");
            
            return Ok($"Dear user {(user_id != null ? user_id : "anonymous")} the Auth controller is alive and ready");
        }

        [HttpGet("tokenstatus/{redirect}")]
        public async Task<ActionResult<ResultResponse>> TokenStatus(bool redirect) // some redirects will be mandatory and others not. e.g if user is on login page but already logged in redirect is mandatory, where as if user is not logged in redirect may need to be avoided
        {
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            string? username = (string?) HttpContext.Items["username"];
            _logger.CLogInfo($"/tokenstatus has been requested in the Auth controller from user = {(user_id != null ? user_id : "anonymous")}");
            ResultResponse response = (ResultResponse) HttpContext.Items["resultresponse"];
            if (response.errorCollection.hasErrors()){
                return StatusCode(500, response);
            }
            response.outcome = ResultOutcome.INVALID_TOKEN;
            if (user_id == null)
            {
                response.message = "Invalid Token";
                response.errors.Add(new Error("Token is invalid", "token_invalid"));
                response.redirect = redirect ? $"/login" : "";
                return Ok(response);
            }
            User? userDoesExist = await repository.UserExists((Guid) user_id);
            if (null == userDoesExist)
            {
                response.errors.Add(new Error("Token is invalid", "token_invalid"));
                response.redirect = redirect ? $"/login" : "";
            } else{
                response.outcome = ResultOutcome.SUCCESS;
                response.message = "Token is valid";
                response.redirect = $"/results/user/{username}";
                response.verfiedUsername = userDoesExist.Username;
            }
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<ResultResponse>> Register(UserTransfer user)
        {
            ResultResponse response = (ResultResponse) HttpContext.Items["resultresponse"];
            ErrorCollection errorCollection = user.GetClientErrors();
            if (errorCollection.hasErrors()){
                response.errorCollection = errorCollection;
                return StatusCode(400, response);
            }
            _logger.CLogInfo($"/register has been requested with username='{user.Username}' and password='{user.Password}'");
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            string? username = (string?) HttpContext.Items["username"];
            if (user_id != null && null != (await repository.UserExists((Guid) user_id)))
            {
                response.redirect = $"/results/user/{username}";
                response.message = "Already logged in... redirecting to /results";
                response.AddError("You are already logged in", "register_already_logged_in");
                return StatusCode(400, response);
            }
            await repository.CreateUser(response, user);
            if (response.outcome == ResultOutcome.SUCCESS)
            {
                response.redirect = "/login";
                return StatusCode(201, response);
            }
            else
                return StatusCode(400, response); //username already exists, incorrect formatting ect.
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(UserTransfer user)
        {
            LoginResponse resultResponse = new LoginResponse((ResultResponse) HttpContext.Items["resultresponse"]);
            ErrorCollection errorCollection = user.GetClientErrors();
            if (errorCollection.hasErrors()){
                resultResponse.errorCollection = errorCollection;
                return StatusCode(400, resultResponse);
            }
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            string? username = (string?) HttpContext.Items["username"];
            if (user_id != null && null != (await repository.UserExists((Guid) user_id)))
            {
                resultResponse.redirect = $"/results/user/{user.Username}";
                resultResponse.message = "Already logged in... redirecting to /results";
                resultResponse.AddError("You are already logged in", "login_already_logged_in");
                return StatusCode(400, resultResponse);
            }
            _logger.CLogInfo($"/login has been requested with username='{user.Username}' and password='{user.Password}'");
            string token = await repository.AuthenticateUser(resultResponse, user);
            //HttpContext.Response.Headers.Add("Authorization", resultResponse.message);
            int token_expires = (Custom.Utility.sharedConfig.token_expires != null) ? (int) Custom.Utility.sharedConfig.token_expires : 90;
            if (resultResponse.outcome == ResultOutcome.SUCCESS){
                resultResponse.redirect = $"/results/user/{user.Username}";
                HttpContext.Response.Cookies.Append("results_net_token", token, new CookieOptions{
                   /* Domain = "https://localhost:7000",*/
                   Expires = DateTimeOffset.UtcNow.AddDays(token_expires)
                });
                return Ok(resultResponse);
            }
            else
                return StatusCode(400, resultResponse);
        }

        [HttpGet("testing")]
        public async Task<ActionResult<ResultResponse>> Testing()
        {
            ResultResponse response = (ResultResponse) HttpContext.Items["resultresponse"];
            //await repository.Testing(response);
            response.message = "test confirmed";
            return Ok(response);
        }

        [HttpGet("alldata")]
        public async Task<ActionResult<AllDataResponse>> AllData()
        {
            AllDataResponse response =  new AllDataResponse();
            await repository.GetAllData(response);
            return Ok(response);
        }
    }
}