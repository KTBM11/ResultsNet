using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Data;
using ResultsNet.Entities;
using ResultsNet.Entities.Old;
using ResultsNet.TransferObjects;

namespace ResultsNet.Repositories{
    public class ResultsRepository{
        private readonly ILogger<ResultsRepository> _logger;
        private readonly IConfiguration configuration;
        public ResultsDBContext database;
        public OGContext oldContext;
        public ResultsRepository(ILogger<ResultsRepository> logger, ResultsDBContext db, OGContext oldDb, IConfiguration configuration)
        {
            database = db;
            oldContext = oldDb;
            _logger = logger;
            this.configuration = configuration;
            _logger.CLogInfo("Results Repository has loaded");
        }

        private Regex? getConfigRegex(string? regex)
        {
            try{
                return new Regex(regex);
            } catch (Exception e){
                if (regex != null)
                    _logger.CLogDebug("Error parsing regex");
            }
            return null;
        }

        public List<Error> ValidateUsernameAndPasswordFormat(string username, string password)
        {
            List<Error> errors = new List<Error>();
            ConfigModel config = Custom.Utility.sharedConfig;
            Regex? usernameRegex = getConfigRegex(config.username_expression);
            Regex? passwordRegex = getConfigRegex(config.password_expression);
            if (username.Length < config.username_minlength || username.Length > config.username_maxlength)
            {
                errors.Add(new Error($"Username must be between {config.username_minlength} and {config.username_maxlength} characters", "username_incorrect_length"));
            }
            if (usernameRegex != null && !usernameRegex.Match(username).Success)
            {
                errors.Add(new Error(config.username_format_message, "username_format_mismatch"));
            }
            if (password.Length < config.password_minlength || password.Length > config.password_maxlength)
            {
                errors.Add(new Error($"Password must be between {config.password_minlength} and {config.password_maxlength} chracters", "password_incorrect_length"));   
            }
            if (passwordRegex != null && !passwordRegex.Match(password).Success)
            {
                errors.Add(new Error(config.password_format_message, "password_format_mismatch"));
            }
            return errors;
        }


        public async Task CreateUser(ResultResponse response, UserTransfer user)
        {
            List<Error> formatErrors = ValidateUsernameAndPasswordFormat(user.Username, user.Password);
            if (formatErrors.Count > 0)
            {
                response.message = "There were errors with the username and/or password";
                response.outcome = ResultOutcome.FAILURE;
                response.errors.AddRange(formatErrors);
                return;
            }

            User createdUser = user.ToNewUser();
            MySqlInsertResponse queryResponse = await database.InsertNewUser(createdUser);
            response.message = queryResponse.Msg;
            response.outcome = queryResponse.success ? ResultOutcome.SUCCESS : ResultOutcome.FAILURE;
            response.obj = createdUser;
            response.fromQueryResponse(queryResponse);
            /*
            if (!queryResponse.success && queryResponse.ErrorCode.Equals("DuplicateKeyEntry"))
            {
                response.errors.Add(new Error(queryResponse.Msg, "username_already_exists"));
            } else if (!queryResponse.success)
            {
                response.errors.Add(new Error(queryResponse.Msg, "unknown"));
            }*/
        }

        /*public async Task CreateNewCareer(CreateResponse response, CareerTransfer career)
        {
            MySqlInsertResponse queryResponse = await database.InsertNewCareer(career);
            response.message = queryResponse.Msg;
            response.outcome = queryResponse.success ? ResultOutcome.SUCCESS : ResultOutcome.FAILURE;
            if (queryResponse.success){
                response.InsertId = queryResponse.InsertId;
                return;
            } else {
                response.errors.Add(new Error(queryResponse.Msg, queryResponse.ErrorCode));
            }
        }*/
        public async Task CreateNewCareer(CreateResponse response, Guid user_id, string careerName)
        {
            MySqlInsertResponse queryResponse = await database.InsertNewCareer(user_id, careerName);
            response.fromQueryResponse(queryResponse);
            if (queryResponse.success){
                response.InsertId = queryResponse.InsertId;
                response.InsertTime = queryResponse.InsertTime;
            }
        }

        public async Task CreateNewSeason(CreateResponse response, Guid user_id, Guid careerId, string careerName, string teamName){
            MySqlInsertResponse queryResponse = await database.InsertNewSeason(user_id, careerId, careerName, teamName);
            response.fromQueryResponse(queryResponse);
            if (queryResponse.success){
                response.InsertId = queryResponse.InsertId;
                response.InsertTime = queryResponse.InsertTime;
            }
        }

        private List<Error> formatNameErrors(string name)
        {
            ConfigModel config = Custom.Utility.sharedConfig;
            List<Error> nameErrors = new List<Error>();
            Regex? nameRegex = getConfigRegex(config.competition_format_name_expression);  
            if (name.Length < config.competition_format_name_minlength || name.Length > config.competition_format_name_maxlength)
            {
                nameErrors.Add(new Error($"Name must be between {config.competition_format_output_minlength} and {config.competition_format_name_maxlength} characters", "format_name_incorrect_length"));
            }
            if (nameRegex != null && !nameRegex.Match(name).Success)
            {
                nameErrors.Add(new Error(config.competition_format_name_format_message, "format_name_format_mismatch"));
            }
            return nameErrors;
        }

        private List<Error> formatPositionErrors(string pos)
        {
            ConfigModel config = Custom.Utility.sharedConfig;
            List<Error> posErrors = new List<Error>();
            Regex? posRegex = getConfigRegex(config.competition_format_position_expression);
            int? min = config.competition_format_position_minlength;
            int? max = config.competition_format_position_maxlength;
            if (pos.Length < min || pos.Length > max)
            {
                posErrors.Add(new Error($"Position must be between {min} and {max} characters", "competition_format_position_incorrect_length"));
            }
            if (posRegex != null && !posRegex.Match(pos).Success)
            {
                posErrors.Add(new Error(config.competition_format_position_format_message, "competition_format_position_format_mismatch"));
            }

            return posErrors;
        }

        private List<Error> formatOutputErrors(string output)
        {
            _logger.CLogDebug("Umm???");
            ConfigModel config = Custom.Utility.sharedConfig;
            int? min = config.competition_format_output_minlength;
            int? max = config.competition_format_output_maxlength;
            List<Error> errors = new List<Error>();
            Regex? regex = getConfigRegex(config.competition_format_output_expression);
            if (output.Length < min || output.Length > max)
                errors.Add(new Error($"Output must be between {min} and {max} characters", "competition_format_output_incorrect_length"));
            if (regex != null && !regex.Match(output).Success)
                errors.Add(new Error(config.competition_format_position_format_message, "competition_format_output_format_mismatch"));
            return errors;
        }

        private List<CompetitionFormat>? competitionFormatsFromTransfer(ResultResponse response, Guid user_id, CompetitionFormatTransfer formatTransfer)
        {
            List<CompetitionFormat>? officialFormats = new List<CompetitionFormat>();
            List<Error> nameErrors = formatNameErrors(formatTransfer.Name);
            if (nameErrors.Count > 0)
            {
                response.outcome = ResultOutcome.FAILURE;
                response.AddErrors(nameErrors);
                _logger.CLogDebug("name errors apparently");
                return null;
            }
            if (formatTransfer.formats.Count < 1)
            {
                response.outcome = ResultOutcome.FAILURE;
                response.AddError("At least one valid format is required", "error_no_formats");
                _logger.CLogDebug("no formats apparently");
                return null;
            }
            for (int i = 0; i < formatTransfer.formats.Count; i++)
            {
                CompetitionFormatTransfer.format format = formatTransfer.formats[i];
                List<Error> posErrors = formatPositionErrors(format.Position);
                List<Error> outErrors = formatOutputErrors(format.Output);
                if (posErrors.Count > 0 || outErrors.Count > 0)
                {
                    response.AddErrors(posErrors);
                    response.AddErrors(outErrors);
                    response.outcome = ResultOutcome.FAILURE;
                    _logger.CLogDebug(response.errors.AsListString());
                    return null;
                }

                officialFormats.Add(new CompetitionFormat
                {
                    user_id = user_id,
                    Name = formatTransfer.Name,
                    Position = format.Position,
                    Output = format.Output,
                });
            }
            return officialFormats;
        }

        public async Task CreateNewCompetitionFormat(ResultResponse response, Guid user_id, CompetitionFormatTransfer formatTransfer){
            List<CompetitionFormat>? officialFormats = competitionFormatsFromTransfer(response, user_id, formatTransfer);
            if (officialFormats == null)
            {
                return;
            }
            MySqlResponse queryResponse = await database.InsertNewCompetitionFormat(user_id, officialFormats);
            response.fromQueryResponse(queryResponse);
            //response.outcome = ResultOutcome.SUCCESS;
        }

        public async Task CreateCompetition(CreateResponse response, Guid user_id, CompetitionTransfer compTransfer)
        {
            MySqlInsertResponse queryResponse = await database.InsertNewCompetition(user_id, compTransfer);
            response.fromQueryResponse(queryResponse);
            if (queryResponse.success)
            {
                response.InsertId = queryResponse.InsertId;
                response.InsertTime = queryResponse.InsertTime;
            }
        }

        public async Task CreateResult(CreateResponse response, Guid user_id, ResultTransfer transfer)
        {
            MySqlInsertResponse queryResponse = await database.InsertNewResult(user_id, transfer);
            response.fromQueryResponse(queryResponse);
            if (queryResponse.success)
            {
                response.InsertId = queryResponse.InsertId;
                response.InsertTime =queryResponse.InsertTime;
            }
        }

        public async Task EditCompetitionFormat(ResultResponse response, Guid user_id, CompetitionFormatTransferEdit formatTransfer)
        {
            List<CompetitionFormat>? officialFormats = competitionFormatsFromTransfer(response, user_id, formatTransfer);
            if (officialFormats == null)
            {
                return;
            }
            MySqlResponse queryResponse = await database.EditCompetitionFormat(formatTransfer.ogName, user_id, officialFormats);
            response.fromQueryResponse(queryResponse);
        }

        public async Task EditCareer(ResultResponse response, Guid user_id, Guid careerId, string careerName)
        {
            MySqlResponse queryResponse = await database.EditCareer(user_id, careerId, careerName);
            response.fromQueryResponse(queryResponse);
        }

        public async Task EditSeason(ResultResponse response, Guid user_id, Guid seasonId, string name, string teamName)
        {
            MySqlResponse queryResponse = await database.EditSeason(user_id, seasonId, name, teamName);
            response.fromQueryResponse(queryResponse);
        }

        public async Task EditCompetition(ResultResponse response, Guid user_id, CompetitionTransferEdit compTransfer)
        {
            MySqlResponse queryResponse = await database.EditCompetition(user_id, compTransfer);
            response.fromQueryResponse(queryResponse);
        }

        public async Task ShiftResult(ResultResponse response, Guid user_id, ShiftResultTransfer transfer)
        {
            MySqlResponse queryResponse = await database.ShiftResult(user_id, transfer);
            response.fromQueryResponse(queryResponse);
        }

        public async Task ChangeSettings(ResultResponse response, Guid user_id, SettingsTransfer transfer)
        {
            MySqlResponse queryResponse = await database.ChangeSettings(user_id, transfer);
            response.fromQueryResponse(queryResponse);
        }

        public async Task RemoveCareer(CareerDataResponse response, Guid CareerId, Guid user_id, Guid? selectedCareerId)
        {
            MySqlFetchResponse<CareerData> queryResponse = await database.RemoveCareer(user_id, CareerId, selectedCareerId);
            response.fromQueryResponse(queryResponse);
            if (queryResponse.success){
                response.careerData = queryResponse.entity;
                response.hasPermissionToEdit = queryResponse.requestUserMatchesTarget;
            }
        }

        public async Task RemoveSeason(ResultResponse response, Guid user_id, Guid seasonId)
        {
            MySqlResponse queryResponse = await database.RemoveSeason(user_id, seasonId);
            response.fromQueryResponse(queryResponse);
        }

        public async Task RemoveCompetitionFormat(ResultResponse response, Guid user_id, string name)
        {
            MySqlResponse queryResponse = await database.RemoveCompetitionFormat(user_id, name);
            response.fromQueryResponse(queryResponse);
        }

        public async Task RemoveCompetition(ResultResponse response, Guid user_id, Guid competitionId)
        {
            MySqlResponse queryResponse = await database.RemoveCompetition(user_id, competitionId);
            response.fromQueryResponse(queryResponse);
        }

        public async Task RemoveResult(ResultResponse response, Guid user_id, Guid resultId)
        {
            MySqlResponse queryResponse = await database.RemoveResult(user_id, resultId);
            response.fromQueryResponse(queryResponse);
        }


        /*public async Task<LoginResponse> LoginUser(UserTransfer user)
        {
            LoginResponse loginResponse = new LoginResponse();
            if (mainUser == null){
                loginResponse.message = "There are no users";
            } else if (!Custom.Utility.VerifyPasswordHash(user.Password, new Password(mainUser.PasswordHash, mainUser.PasswordSalt)))
            {
                loginResponse.message = "Your password does not match the main user";
            } else {
                //string token = CreateToken(user.ToNewUser()); // should get user from database
                string token = Custom.Utility.CreateToken(mainUser);
                loginResponse.access_token = token;
                loginResponse.message = "You have (1) new message!";
            }
            return loginResponse;
        }*/

        public async Task<string> AuthenticateUser(LoginResponse response, UserTransfer user)
        {
            MySqlFetchResponse<User> databaseResponse = await database.GetSpecificUser(user.Username);
            User dbUser = databaseResponse.entity;
            response.message = databaseResponse.Msg;
            response.outcome = ResultOutcome.FAILURE;
            if (databaseResponse.success && Custom.Utility.VerifyPasswordHash(user.Password, new Password(dbUser.PasswordHash, dbUser.PasswordSalt)))
            {
                string token = Custom.Utility.CreateToken(dbUser);
                response.access_token = token;
                response.message = "Successfully logged in";
                response.outcome = ResultOutcome.SUCCESS;
                return token;
            } else{
                response.errorCollection.AddError("global", "Incorrect username or password", "login_record_mismatch");
                response.message = "Incorrect username or password";
            }
            return "";
        }

        public async Task getCareerData(CareerDataResponse response, DataRequestTransfer data)
        {
            MySqlFetchResponse<CareerData> dataQuery = await database.fetchCareerData(data);
            response.careerData = dataQuery.entity;
            response.outcome = ResultOutcome.SUCCESS;
            response.hasPermissionToEdit = dataQuery.requestUserMatchesTarget;
            response.fromQueryResponse(dataQuery);
            if (!dataQuery.success)
            {
                response.outcome = ResultOutcome.FAILURE;
                response.AddError(dataQuery.Msg, dataQuery.ErrorCode);
            }
        }

        public async Task<User?> UserExists(Guid user_id)
        {
            MySqlFetchResponse<User> queryResponse = await database.GetSpecificUser(user_id);
            return queryResponse.entity;
        }

        public async Task Testing(ResultResponse response)
        {
            await database.Testing(response);
        }

        public async Task GetAllData(AllDataResponse response)
        {
            await database.FetchAllData(response);
        }

        public async Task<Object> PerformMigration()
        {
            OldData oldData = await oldContext.getOldData();
            Guid user_id = new Guid("8ea7a394-1321-46d2-8497-d36da25c205d");
            CareerData newData = oldData.ToCareerData(user_id);
            await database.UploadCareerData(newData);
            return newData;
        }

    }
}