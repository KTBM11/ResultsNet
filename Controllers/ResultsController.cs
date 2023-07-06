using Microsoft.AspNetCore.Mvc;
using ResultsNet.Repositories;
using ResultsNet.Custom;
using ResultsNet.TransferObjects;
using ResultsNet.ApiResponse;
using System.Text.Json;
using ResultsNet.Entities.Old;

namespace ResultsNet.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    public class ResultsController : ControllerBase
    {
        private readonly ILogger<ResultsController> _logger;
        private readonly ResultsRepository repository;

        public ResultsController(ILogger<ResultsController> logger, ResultsRepository repository)
        {
            _logger = logger;
            this.repository = repository;
            _logger.CLogInfo("Results controller loaded");
        }

        [HttpGet("alive")]
        public IActionResult Alive()
        {
            _logger.CLogInfo("/alive has been requested in the Results controller");
            return Ok("The Results controller is alive and ready");
        }

        [HttpGet("user/{username}/{CareerId?}/{SeasonId?}/")]
        public async Task<ActionResult<CareerDataResponse>> GetUserData(string username, string? CareerId, string? SeasonId)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CareerDataResponse dataResponse = new CareerDataResponse(baseResponse);

            Guid? cId;
            Guid? sId;
            try{
                cId = CareerId != null ? new Guid(CareerId) : null;
                sId = SeasonId != null ? new Guid(SeasonId) : null;
            } catch (FormatException e)
            {
                dataResponse.outcome = ResultOutcome.FAILURE;
                dataResponse.AddError("Invalid careerId or SeasonId Format", "id_invalid_format");
                dataResponse.message = "Either the careerid or seasonid has an invalid format";
                dataResponse.errorCollection.AddError("global", "Invalid careerId or SeasonId Format", "id_invalid_format");
                return StatusCode(400, dataResponse);
            }
            string? requestUsername = (string?) HttpContext.Items["username"];
            Guid? requestUserId = (Guid?) HttpContext.Items["user_id"];
            UserTransfer? RequestUser = null;
            if (requestUsername != null && requestUserId != null)
                RequestUser = new UserTransfer{Username= requestUsername, user_id =requestUserId};
            DataRequestTransfer dataRequest = new DataRequestTransfer
            {
                username=username,
                CareerId=cId,
                SeasonId=sId,
                RequestUser=RequestUser,
            };
            await repository.getCareerData(dataResponse, dataRequest);
            if (dataResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, dataResponse);
            }
            string? TokenUsername = (string?) HttpContext.Items["username"];
            dataResponse.message = "Successfully fetched user page";
            return Ok(dataResponse);
        }

        /*[HttpPost("add-career")]
        public async Task<ActionResult<CreateResponse>> AddCareer(CareerTransfer career){
            _logger.CLogDebug($"results/add-career has been requested with the following values\nName: {career.Name}");
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CreateResponse response = new CreateResponse(baseResponse);
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            string? username = (string?) HttpContext.Items["username"];
            if (user_id == null)
            {
                response.message = "No Token";
                response.errors.Add(new Error("Token is invalid", "token_invalid"));
                
                return StatusCode(400, response);
            }
            career.user_id = user_id;
            await repository.CreateNewCareer(response, career);
            if (response.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, response);
            }
            response.redirect = $"/results/user/{username}/{response.InsertId}";
            return StatusCode(201, response);
        }*/

        [HttpPost("update/add-career")]
        public async Task<ActionResult<CreateResponse>> AddCareer(CareerTransfer career){
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CreateResponse response = new CreateResponse(baseResponse);
            ErrorCollection collection = career.GetClientErrors();
            if (collection.hasErrors())
            {
                response.errorCollection = collection;
                return StatusCode(400, response);
            }
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            await repository.CreateNewCareer(response, (Guid) user_id, career.Name);
            if (response.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, response);
            }
            response.redirect = $"/results/user/{response.verfiedUsername}/{response.InsertId}";
            //response.AddError("Error for no reason lol", "lmao_error");
            return StatusCode(201, response);
        }

        [HttpPost("update/add-season")]
        public async Task<ActionResult<CreateResponse>> AddSeason(SeasonTransfer season)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CreateResponse response = new CreateResponse(baseResponse);
            ErrorCollection collection = season.GetClientErrors();
            if (collection.hasErrors())
            {
                response.errorCollection = collection;
                return StatusCode(400, response);
            }
            Guid? user_id = (Guid?) HttpContext.Items["user_id"];
            if (season.SelectedCareerId == null)
            {
                response.message = "Career id is required";
                response.AddError("Career Id is required", "career_id_no_exist");
                response.outcome = ResultOutcome.FAILURE;
                return StatusCode(400, response);
            }
            await repository.CreateNewSeason(response, (Guid) user_id, (Guid) season.SelectedCareerId, season.Name, season.TeamName);
            if (response.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, response);
            }
            response.redirect = $"results/user/{response.verfiedUsername}/{season.SelectedCareerId}/{response.InsertId}";
            return StatusCode(201, response);
        }

        [HttpPost("update/add-competition-format")]
        public async Task<ActionResult<ResultResponse>> AddCompetitionFormat(CompetitionFormatTransfer formatTransfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            ErrorCollection collection = formatTransfer.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.CreateNewCompetitionFormat(baseResponse, user_id, formatTransfer);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(201, baseResponse);
        }

        [HttpPost("update/add-competition")]
        public async Task<ActionResult<CreateResponse>> AddCompetition(CompetitionTransfer compTransfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CreateResponse response = new CreateResponse(baseResponse);
            ErrorCollection collection = compTransfer.GetClientErrors();
            if (collection.hasErrors())
            {
                response.errorCollection = collection;
                return StatusCode(400, response);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.CreateCompetition(response, user_id, compTransfer);
            if (response.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, response);
            }
            return StatusCode(201, response);
        }

        [HttpPost("update/add-result")]
        public async Task<ActionResult<CreateResponse>> AddResult(ResultTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CreateResponse response = new CreateResponse(baseResponse);
            ErrorCollection collection = transfer.GetClientErrors();
            if (collection.hasErrors())
            {
                response.errorCollection = collection;
                return StatusCode(400, response);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.CreateResult(response, user_id, transfer);
            if (response.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, response);
            }
            return StatusCode(201, response);
        }

        [HttpPut("update/edit-career")]
        public async Task<ActionResult<ResultResponse>> EditCareer(CareerTransferEdit career)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            ErrorCollection collection = career.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            await repository.EditCareer(baseResponse, user_id, career.CareerId, career.Name);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpPut("update/edit-season")]
        public async Task<ActionResult<ResultResponse>> EditSeason(SeasonTransferEdit season)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            ErrorCollection collection = season.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            if (season.SeasonId == null)
            {
                baseResponse.outcome = ResultOutcome.FAILURE;
                baseResponse.AddError("Season id must be included", "season_id_no_exist");
                return StatusCode(400, baseResponse);
            }
            await repository.EditSeason(baseResponse, user_id, (Guid) season.SeasonId, season.Name, season.TeamName);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpPut("update/edit-competition")]
        public async Task<ActionResult<ResultResponse>> EditCompetition(CompetitionTransferEdit comp)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            ErrorCollection collection = comp.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            if (comp.CompetitionId == null)
            {
                baseResponse.AddError("Competition id must be included", "competition_id_no_exist");
                return StatusCode(400, baseResponse);
            }
            await repository.EditCompetition(baseResponse, user_id, comp);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpPost("update/edit-competition-format")]
        public async Task<ActionResult<ResultResponse>> EditCompetitionFormat(CompetitionFormatTransferEdit formatTransfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            ErrorCollection collection = formatTransfer.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.EditCompetitionFormat(baseResponse, user_id, formatTransfer);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(201, baseResponse);
        }

        [HttpPut("update/shift-result")]
        public async Task<ActionResult<ResultResponse>> ShiftResult(ShiftResultTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            ErrorCollection collection = transfer.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.ShiftResult(baseResponse, user_id, transfer);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpPut("update/change-settings")]
        public async Task<ActionResult<ResultResponse>> ChangeSettings(SettingsTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            ErrorCollection collection = transfer.GetClientErrors();
            if (collection.hasErrors())
            {
                baseResponse.errorCollection = collection;
                return StatusCode(400, baseResponse);
            }
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.ChangeSettings(baseResponse, user_id, transfer);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpDelete("update/remove-career")]
        public async Task<ActionResult<CareerDataResponse>> RemoveCareer(RemoveIdTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            CareerDataResponse response = new CareerDataResponse(baseResponse);
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.RemoveCareer(response, transfer.Id, user_id, transfer.SelectedCareerId);
            if (response.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, response);
            }
            _logger.CLogDebug($"SelectedCareerId: {transfer.SelectedCareerId}\nTransferId: {transfer.Id}");
            if (transfer.SelectedCareerId.Equals(transfer.Id))
                response.redirect = $"/results/user/{response.verfiedUsername}";
            return StatusCode(200, response);
        }

        [HttpDelete("update/remove-season")]
        public async Task<ActionResult<ResultResponse>> RemoveSeason(RemoveIdTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.RemoveSeason(baseResponse, user_id, transfer.Id);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            { 
                return StatusCode(400, baseResponse);
            }
            if (transfer.SelectedSeasonId.Equals(transfer.Id))
                baseResponse.redirect = $"/results/user/{baseResponse.verfiedUsername}/{transfer.SelectedCareerId}";
            return StatusCode(200, baseResponse);
        }

        [HttpDelete("update/remove-competition-format")]
        public async Task<ActionResult<ResultResponse>> RemoveCompetitionFormat([FromBody] string name)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.RemoveCompetitionFormat(baseResponse, user_id, name);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpDelete("update/remove-competition")]
        public async Task<ActionResult<ResultResponse>> RemoveCompetition(RemoveIdTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.RemoveCompetition(baseResponse, user_id, transfer.Id);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpDelete("update/remove-result")]
        public async Task<ActionResult<ResultResponse>> RemoveResult(RemoveIdTransfer transfer)
        {
            ResultResponse baseResponse = (ResultResponse) HttpContext.Items["resultresponse"];
            Guid user_id = (Guid) HttpContext.Items["user_id"];
            await repository.RemoveResult(baseResponse, user_id, transfer.Id);
            if (baseResponse.outcome == ResultOutcome.FAILURE)
            {
                return StatusCode(400, baseResponse);
            }
            return StatusCode(200, baseResponse);
        }

        [HttpPost("testing")]
        public async Task<ActionResult> TestUpdate(TestTransfer transfer)
        {
            string url = Request.Path;
            string json = JsonSerializer.Serialize(transfer, new JsonSerializerOptions{
                WriteIndented = false,
            });
            //_logger.CLogDebug($"{url} has been requested with the data:\n{json}");
            string testString = transfer.ToJsonString();
            //_logger.CLogError(transfer.ToJsonString());
            return StatusCode(200, json);
        }

        /*[HttpPost("PerformMigration")]
        public async Task<ActionResult<ResultResponse>> PerformMigration()
        {
            ResultResponse response = new ResultResponse();
            Object data = await repository.PerformMigration();
            response.obj = data;
            return Ok(response);
        }*/

    }
}