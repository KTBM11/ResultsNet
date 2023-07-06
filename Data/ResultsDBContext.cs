using Microsoft.EntityFrameworkCore;
using ResultsNet.Entities;
using ResultsNet.Custom;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResultsNet.ApiResponse;
using MySqlConnector;
using ResultsNet.TransferObjects;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace ResultsNet.Data
{
    public class ResultsDBContext : DbContext // Where the magic happens
    {
        public DbSet<User> user {get; set;}
        public DbSet<Career> career {get; set;}
        public DbSet<Season> season {get; set;}
        public DbSet<CompetitionFormat> competition_format {get; set;}
        public DbSet<Competition> competition {get; set;}
        public DbSet<Result> result {get; set;}
        private readonly ILogger<ResultsDBContext> _logger;
        protected readonly IConfiguration configuration;
        public ResultsDBContext(ILogger<ResultsDBContext> logger, IConfiguration configuration)
        {
            _logger = logger;
            this.configuration = configuration;
            _logger.CLogInfo("Database instance created");
            //var query = this.Database.ExecuteSqlInterpolated
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options){
            string connectionString = $"server={Environment.GetEnvironmentVariable("ASPNETCORE_DB_IP")}; port={Environment.GetEnvironmentVariable("ASPNETCORE_DB_PORT")}; " + 
            $"database={Environment.GetEnvironmentVariable("ASPNETCORE_DB_NAME")}; user=root; password='{Environment.GetEnvironmentVariable("ASPNETCORE_DB_PASSWORD")}'";

            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
            /*options.LogTo(Console.WriteLine, LogLevel.Information);*/
        }

        private static PropertyBuilder setVarcharLength(EntityTypeBuilder entity, string collumnName, string configName){ // assign field lenght based on sharedConfig.json
            object? configValue = Utility.sharedConfig[configName];
            if (configValue != null && configValue.ToString().isInt()){
                int numConfig = int.Parse(configValue.ToString());
                if (numConfig < 0 || numConfig > 65535){
                    throw new Exception("Incorrect config value length, must be between 0 and 65535");
                }

                return entity.Property(collumnName).HasColumnType($"varchar({configValue})");
            }
            return entity.Property(collumnName).HasColumnType($"varchar(32)"); // default to lenght of 32
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>(entity =>{
                entity.HasKey(u => u.user_id);
                entity.HasAlternateKey(u =>  u.Username);
                
                //entity.Property(u => u.username)
                //.HasColumnType("varchar(69)");
                setVarcharLength(entity, "Username", "username_maxlength");
                //setVarcharLength(entity, "Password", "password_maxlength");
                entity.Property("Created").HasDefaultValueSql("(now())");
                entity.Property(u => u.PublicAccount).HasDefaultValue(true);
            }).Entity<Career>(entity =>{
                entity.HasKey(c =>  new {c.user_id, c.CareerId});
                //entity.HasIndex(c => new {c.Name, c.user_id}).IsUnique(); Not doing anymore, too complicated for now
                //entity.HasAlternateKey(c => new {c.user_id, c.Name});
                entity.HasOne(c => c.user) // using fluent api for learning purposes, Will use convention for some other tables
                .WithMany(u => u.careers)
                .HasForeignKey(u => u.user_id); 
                setVarcharLength(entity, "Name", "career_name_maxlength");
                entity.Property("Created").HasDefaultValueSql("(now())");
            }).Entity<Season>(entity =>{
                entity.HasKey(s => new {s.user_id, s.SeasonId});
                entity.HasOne(s => s.career)
                .WithMany(c => c.seasons)
                .HasForeignKey(s => new {s.user_id, s.CareerId});
                setVarcharLength(entity, "Name", "season_name_maxlength");
                setVarcharLength(entity, "TeamName", "season_teamname_maxlength");
                entity.Property("Created").HasDefaultValueSql("(now())");
            }).Entity<CompetitionFormat>(entity =>{
                entity.HasKey(cf => new {cf.user_id, cf.Name, cf.Position});
                entity.HasOne(cf => cf.user)
                .WithMany(u => u.competitionFormats)
                .HasForeignKey(cf => cf.user_id);
                setVarcharLength(entity, "Name", "competition_format_name_maxlength");
                setVarcharLength(entity, "Position", "competition_format_name_maxlength");
                setVarcharLength(entity, "Output", "competition_format_output_maxlength");
            }).Entity<Competition>(entity=>{
                /*entity.HasOne(c => c.competitionFormat)
                .WithMany()
                .HasForeignKey(c => new {c.FormatName, c.user_id})
                .HasPrincipalKey(cf => new {cf.Name, cf.user_id})
                .OnDelete(DeleteBehavior.NoAction);*/
                entity.HasKey(c => new {c.user_id, c.CompetitionId});
                entity.HasOne(c => c.season)
                .WithMany(s => s.competitions)
                .HasForeignKey(c => new {c.user_id, c.SeasonId});
                setVarcharLength(entity, "Name", "competition_name_maxlength");
                setVarcharLength(entity, "FormatName", "competition_format_name_maxlength");
                entity.Property("Created").HasDefaultValueSql("(now())");
            }).Entity<Result>(entity =>{
                entity.HasKey(r => new {r.user_id, r.ResultId});
                entity.HasOne(r => r.competition)
                .WithMany(c => c.results)
                .HasForeignKey(r => new {r.user_id, r.CompetitionId});
                setVarcharLength(entity, "OppTeam", "season_teamname_maxlength");
                entity.Property("Created").HasDefaultValueSql("(now())");
            });
        }

        public async Task<MySqlFetchResponse<User>> GetSpecificUser(Guid user_id)
        {
            MySqlFetchResponse<User> queryResponse = new MySqlFetchResponse<User>();
            try{
                User searchUser = await user.SingleAsync(u => u.user_id == user_id);
                queryResponse.Msg = $"Successfully fetched user of id = '{searchUser.Username}'";
                queryResponse.success = true;
                queryResponse.entity = searchUser;
            } catch (InvalidOperationException e)
            {
                queryResponse.Msg = $"Failed to find user of id = '{user_id}'";
                queryResponse.ErrorCode = "user_id_no_exist";
                queryResponse.success = false;
                queryResponse.doFailure("global", $"Failed to find user of id = '{user_id}'", "user_id_no_exist");
            }
            return queryResponse;
        }

        public async Task<MySqlFetchResponse<User>> GetSpecificUser(string username)
        {
            MySqlFetchResponse<User> queryResponse = new MySqlFetchResponse<User>();
            try{
                User searchUser = await user.SingleAsync(u => u.Username == username);
                queryResponse.Msg = $"Successfully fetched user of username = '{searchUser.Username}'";
                queryResponse.success = true;
                queryResponse.entity = searchUser;
            } catch (InvalidOperationException e)
            {
                queryResponse.Msg = $"The user '{username}' does not exist";
                queryResponse.ErrorCode = "username_no_exist";
                queryResponse.success = false;
                queryResponse.errorCollection.AddError($"global", "The user '{username}' does not exist", "username_no_exist");
            }
            return queryResponse;
        }

        private async Task ListUsers()
        {
            _logger.CLogDebug("Listing users");
            List<User> users = await user.ToListAsync();
            Utility.printList(users);
        }

        //public
        public async Task InsertRandomUser()
        {
            User randomUser = User.Random();
            _logger.CLogDebug(randomUser.ToString());
            await user.AddAsync(randomUser);
            try{
                await SaveChangesAsync();
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
            }
        }

        public async Task<MySqlInsertResponse> InsertNewUser(User newUser)
        {
            MySqlInsertResponse queryResponse = new MySqlInsertResponse();
            _logger.CLogDebug($"Attempting to insert user into db with username = '{newUser.Username}'");
            await user.AddAsync(newUser);
            try{
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully added user '{newUser.Username}' of user_id = '{newUser.user_id}'";
            } catch (DbUpdateException e)
            {
                queryResponse.success = false;
                Exception innerException = e.InnerException;
                _logger.CLogDebug(e.GetType().FullName);
                _logger.CLogDebug(innerException.GetType().FullName);
                if (innerException is MySqlException)
                {
                    MySqlException sqlException = (MySqlException) innerException;
                    _logger.CLogDebug($"Error Code: {sqlException.ErrorCode}");
                    queryResponse.ErrorCode = sqlException.ErrorCode.ToString();
                    if (sqlException.ErrorCode.ToString().Equals("DuplicateKeyEntry"))
                    {
                        _logger.CLogDebug($"Username of '{newUser.Username}' probably already exists");
                        queryResponse.Msg = $"Username of '{newUser.Username}' already exists";
                        queryResponse.errorCollection.AddError("register-username", "Username already exists", "username_already_exists");
                        return queryResponse;
                    }
                }
                queryResponse.errorCollection.AddError("global", "Unknown Error", "error_unknown");
                queryResponse.Msg = $"Unkown Error";
            }
            return queryResponse;
        }

        /*public async Task<MySqlInsertResponse> InsertNewCareer(CareerTransfer newCareer)
        {
            MySqlInsertResponse queryResponse = new MySqlInsertResponse();
            newCareer.CareerId = Guid.NewGuid();
            if (newCareer.user_id == null){
                queryResponse.success = false;
                queryResponse.Msg = "No user_id specified";
                queryResponse.ErrorCode = "user_id_no_exist";
            }
            try{
                Career insertCareer = newCareer.ToCareer();
                await career.AddAsync(insertCareer);
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully added career '{insertCareer.Name}' of CareerId = '{insertCareer.CareerId}'";
                queryResponse.InsertId = insertCareer.CareerId;
            } catch (Exception e){
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unknown";
                _logger.CLogError(e.Message);
            }
            return queryResponse;
        }*/

        private async Task<T> InitCrudQuery<T>(T baseQuery, Guid user_id) where T : MySqlResponse
        {
            MySqlFetchResponse<User> userQuery = await GetSpecificUser(user_id);
            User? user  = userQuery.entity;
            if (user != null)
            {
                baseQuery.requestUserId = user.user_id;
                baseQuery.requestUsername = user.Username;
                baseQuery.requestUser = user;
            } else {
                baseQuery.fromOtherResponse(userQuery);
            }
            return baseQuery;
        }

        public async Task<MySqlInsertResponse> InsertNewCareer(Guid requestUserId, string careerName)
        {
            MySqlInsertResponse queryResponse = await InitCrudQuery(new MySqlInsertResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            Career newCareer = new Career{
                CareerId= Guid.NewGuid(),
                user_id = (Guid) queryResponse.requestUserId,
                Name = careerName,
            };
            try{
                EntityEntry<Career> careerEntry = career.Add(newCareer);
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully added career '{newCareer.Name}' of CareerId = '{newCareer.CareerId}'";
                queryResponse.InsertId = newCareer.CareerId;
                queryResponse.InsertTime = careerEntry.Entity.Created;
            } catch (Exception e){
                _logger.CLogDebug(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unknown";
                queryResponse.errorCollection.AddError("global", "Unknown Error", "error_unknown");
            }
            return queryResponse;
        }

        public async Task<MySqlInsertResponse> InsertNewSeason(Guid requestUserId, Guid careerId, string name, string teamName)
        {
            MySqlInsertResponse queryResponse = await InitCrudQuery(new MySqlInsertResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;

            Season newSeason = new Season{
                SeasonId=Guid.NewGuid(),
                user_id=requestUserId,
                Name=name,
                TeamName=teamName,
                CareerId=careerId,
            };

            try{
                /*bool parentCareerExists = await career.Where(c => c.CareerId.Equals(careerId) && c.user_id.Equals(requestUserId)).AnyAsync();
                if (!parentCareerExists){
                    queryResponse.success = false;
                    queryResponse.Msg = $"The career you are trying to add the season to does not exist";
                    queryResponse.ErrorCode = "career_id_no_exist";
                    queryResponse.errorCollection.AddError("global", "The career you are trying to add the season to does not exist", "career_id_no_exist");
                    return queryResponse;
                }*/
                //EntityEntry<Career> careerEntry = career.Add(newCareer);
                EntityEntry<Season> seasonEntry = season.Add(newSeason);
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully added season '{name}' of SeasonId = '{newSeason.SeasonId}'";
                queryResponse.InsertId = newSeason.SeasonId;
                queryResponse.InsertTime = seasonEntry.Entity.Created;
            } catch (Exception e)
            {
                if (e.InnerException is MySqlException)
                {
                    MySqlException sqlException = (MySqlException) e.InnerException;
                    _logger.CLogError(sqlException.Message);
                    _logger.CLogError(sqlException.ErrorCode.ToString());
                    //response.message = sqlException.ErrorCode.ToString(); //NoReferencedRow2
                    if (sqlException.ErrorCode.ToString().Equals("NoReferencedRow2"))
                    {
                        queryResponse.doFailure("global", "Parent career does not exist", "career_id_no_exist");
                        return queryResponse;
                    }
                }

                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
                queryResponse.errorCollection.AddError("global", "Unknown Error", "error_unknown");
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> InsertNewCompetitionFormat(Guid requestUserId, List<CompetitionFormat> competitionFormats)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try{   
                string formatName = competitionFormats[0].Name;
                bool formatExists = await competition_format.Where(cf => cf.user_id.Equals(queryResponse.requestUserId) && cf.Name.Equals(formatName)).AnyAsync();
                if (formatExists)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "A format of this name already exists";
                    queryResponse.ErrorCode = "format_name_already_exists";
                    queryResponse.errorCollection.AddError("format_data_name", "A format of this name already exists", "format_name_already_exists");
                    return queryResponse;
                }
                //int affectedRows = await this.Database.ExecuteSqlInterpolatedAsync($"delete from competition_format where `user_id`={queryResponse.requestUserId} AND `Name`={ogName}");
                await competition_format.AddRangeAsync(competitionFormats);
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully added competition format '{formatName}' to user_id of {queryResponse.requestUserId}";

            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
                queryResponse.errorCollection.AddError("global", "An error has occured", "error_unkown");
            }
            return queryResponse;
        }

        public async Task<MySqlInsertResponse> InsertNewCompetition(Guid requestUserId, CompetitionTransfer competitionTransfer)
        {
            MySqlInsertResponse queryResponse = await InitCrudQuery(new MySqlInsertResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            Competition insertComp = competitionTransfer.ToCompetition(requestUserId);
            try{
                /*bool parentSeasonExists = await season.Where(s => s.user_id.Equals(requestUserId) && s.SeasonId.Equals(insertComp.SeasonId)).AnyAsync();
                if (!parentSeasonExists)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "The season id for the competition does not exist";
                    queryResponse.ErrorCode = "season_id_no_exist";
                    queryResponse.errorCollection.AddError("global", "The season id for the competition does not exist", "season_id_no_exist");
                    return queryResponse;
                }*/
                bool formatExists = await competition_format.Where(cf => cf.user_id.Equals(queryResponse.requestUserId) && cf.Name.Equals(insertComp.FormatName)).AnyAsync();
                if (!formatExists)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "This competition format does not actually exist";
                    queryResponse.ErrorCode = "competition_format_no_exist";
                    queryResponse.errorCollection.AddError("add-compt-format-name", "This competition format does not actually exist", "competition_format_no_exist");
                    return queryResponse;
                }
                EntityEntry<Competition> compEntry = await competition.AddAsync(insertComp);
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Succesfully added competition of name '{insertComp.Name}' with CompetitionId of {insertComp.CompetitionId}";
                queryResponse.InsertId = insertComp.CompetitionId;
                queryResponse.InsertTime = compEntry.Entity.Created;
            } catch (Exception e)
            {
                if (e.InnerException is MySqlException)
                {
                    MySqlException sqlException = (MySqlException) e.InnerException;
                    _logger.CLogError(sqlException.Message);
                    _logger.CLogError(sqlException.ErrorCode.ToString());
                    //response.message = sqlException.ErrorCode.ToString(); //NoReferencedRow2
                    if (sqlException.ErrorCode.ToString().Equals("NoReferencedRow2"))
                    {
                        queryResponse.doFailure("global", "Parent season does not exist", "season_id_no_exist");
                        return queryResponse;
                    }
                }
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
                queryResponse.errorCollection.AddError("global", "Unknown Error", "error_unknown");
            }
            return queryResponse;
        }

        public async Task<MySqlInsertResponse> InsertNewResult(Guid requestUserId, ResultTransfer resultTransfer)
        {
            MySqlInsertResponse queryResponse = await InitCrudQuery(new MySqlInsertResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            Result newResult = resultTransfer.ToResult(requestUserId);
            try{
                /*bool parentCompExists = await competition.Where(r => r.user_id.Equals(requestUserId) && r.CompetitionId.Equals(newResult.CompetitionId)).AnyAsync();
                //_logger.CLogError($"user_id = {requestUserId}, CompetitionId = {newResult.CompetitionId}");
                if (!parentCompExists)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "The competition id for the result does not exist";
                    queryResponse.ErrorCode = "competition_id_no_exist";
                    return queryResponse;
                }*/
                
                /*int newPosition = await result.Where(r => r.user_id.Equals(requestUserId) && r.CompetitionId.Equals(newResult.CompetitionId)).CountAsync() + 1;
                newResult.Position = newPosition;
                EntityEntry<Result> resultEntry = await result.AddAsync(newResult);
                await SaveChangesAsync();*/
                List<Result> insertedResults = await result.FromSqlInterpolated($"call add_result({newResult.ResultId}, {newResult.user_id}, {newResult.GoalsFor}, {newResult.GoalsAgaints}, {newResult.OppTeam}, {newResult.Home}, {newResult.Replay}, {newResult.CompetitionId})").ToListAsync();
                if (insertedResults.Count != 1)
                {
                    queryResponse.doFailure("global", "Parent competition does not exist", "competition_id_no_exist");
                    return queryResponse;
                }


                queryResponse.success = true;
                queryResponse.Msg = $"Successfully added result of ResultId = '{newResult.ResultId}'";
                queryResponse.InsertId = newResult.ResultId;
                queryResponse.InsertTime = insertedResults[0].Created;
            }catch (Exception e)
            {
                if (e.InnerException is MySqlException)
                {
                    MySqlException sqlException = (MySqlException) e.InnerException;
                    _logger.CLogError(sqlException.Message);
                    _logger.CLogError(sqlException.ErrorCode.ToString());
                    //response.message = sqlException.ErrorCode.ToString(); //NoReferencedRow2
                    if (sqlException.ErrorCode.ToString().Equals("NoReferencedRow2"))
                    {
                        queryResponse.doFailure("global", "Parent competition does not exist", "competition_id_no_exist");
                        return queryResponse;
                    }
                }
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> EditCareer(Guid requestUserId, Guid careerId, string name)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try{
                Career? editCareer = await career.Where(c => c.user_id.Equals(requestUserId) && c.CareerId.Equals(careerId)).FirstOrDefaultAsync();
                if (editCareer == null)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "The Career you are trying to edit does not exist";
                    queryResponse.ErrorCode = "career_id_no_exist";
                    queryResponse.errorCollection.AddError("global", "The Career you are trying to edit does not exist", "career_id_no_exist");
                    return queryResponse;
                }
                editCareer.Name = name;
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully changed name of Career with CareerId = '{careerId}' to '{name}";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
                queryResponse.errorCollection.AddError("global", "Unknown Error", "error_unknown");
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> EditSeason(Guid requestUserId, Guid seasonId, string name, string teamName)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                Season? editSeason = await season.Where(s => s.user_id.Equals(requestUserId) && s.SeasonId.Equals(seasonId)).FirstOrDefaultAsync();
                if (editSeason == null)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "The season you are trying to edit does not exist";
                    queryResponse.ErrorCode = "season_id_no_exist";
                    return queryResponse;
                }
                editSeason.Name = name;
                editSeason.TeamName = teamName;
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully changed name of season with SeasonId = '{seasonId} to '{name}";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> EditCompetition(Guid requestUserId, CompetitionTransferEdit competitionTransfer)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                Competition? editComp = await competition.Where(c => c.user_id.Equals(requestUserId) && c.CompetitionId.Equals(competitionTransfer.CompetitionId)).FirstOrDefaultAsync();
                if (editComp == null)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "The competition you are trying to edit does not exist";
                    queryResponse.ErrorCode = "competition_id_no_exist";
                    queryResponse.errorCollection.AddError("global", "The competition you are trying to edit does not exist", "competition_id_no_exist");
                    return queryResponse;
                }
                editComp.Name = competitionTransfer.Name;
                editComp.FormatName = competitionTransfer.FormatName;
                editComp.StartAt = competitionTransfer.StartAt;
                editComp.Concluded = competitionTransfer.Concluded;
                editComp.Minimized = competitionTransfer.Minimized;
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully updated competition of CompetitionId = `{editComp.CompetitionId}`";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
                queryResponse.errorCollection.AddError("global", "Unknown Error", "error_unknown");
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> EditCompetitionFormat(string ogName, Guid requestUserId, List<CompetitionFormat> competitionFormats)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                string formatName = competitionFormats[0].Name;
                bool formatExists = await competition_format.Where(cf => cf.user_id.Equals(queryResponse.requestUserId) && cf.Name.Equals(formatName)).AsNoTracking().AnyAsync();
                _logger.CLogDebug($"{formatName}, {ogName}");
                if (formatExists && !ogName.Equals(formatName))
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "A format of this name already exists";
                    queryResponse.ErrorCode = "format_name_already_exists";
                    queryResponse.errorCollection.AddError("format_data_name", "A format of this name already exists", "format_name_already_exists");
                    return queryResponse;
                }
                int affectedRows = await this.Database.ExecuteSqlInterpolatedAsync($"delete from competition_format where `user_id`={queryResponse.requestUserId} AND `Name`={ogName}");
                
                if (affectedRows == 0)
                {   
                    queryResponse.success = false;
                    queryResponse.Msg = "The format you are editing does not exist";
                    queryResponse.ErrorCode = "format_no_exist";
                    queryResponse.errorCollection.AddError("global", "The format you are editing does not exist", "format_no_exist");
                    return queryResponse;
                }
                await competition_format.AddRangeAsync(competitionFormats);
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully edit competition format '{formatName}' to user_id of {queryResponse.requestUserId}";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
            }
            return queryResponse;
        }

        public async Task <MySqlResponse> ShiftResult(Guid requestUserId, ShiftResultTransfer transfer)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                int affectedRows = await this.Database.ExecuteSqlInterpolatedAsync($"call shift_result({requestUserId}, {transfer.ResultId}, {transfer.newPosition})");
                queryResponse.Msg = "Successfully shifted result";
                queryResponse.success = true;
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.defaultError();
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> ChangeSettings(Guid requestUserId, SettingsTransfer transfer)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try{
                if (transfer.PublicAccount != null){
                    User user = queryResponse.requestUser;
                    user.PublicAccount = (bool) transfer.PublicAccount;
                    await SaveChangesAsync();
                    queryResponse.Msg = "Successfully updated settings";
                    queryResponse.success = true;
                }
            } catch (Exception e){
                _logger.CLogError(e.Message);
                queryResponse.defaultError();
            }
            return queryResponse;
        }

        public async Task<MySqlFetchResponse<CareerData>> RemoveCareer(Guid requestUserId, Guid CareerId, Guid? selectedCareerId)
        {
            MySqlFetchResponse<CareerData> queryResponse = await InitCrudQuery(new MySqlFetchResponse<CareerData>(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                /*Career removeCareer = new Career {
                    CareerId = CareerId,
                    user_id=requestUserId
                };*/
                Career? searchCareer = await career.FirstOrDefaultAsync(c => c.CareerId.Equals(CareerId) && c.user_id.Equals(requestUserId));
                //Entry(removeCareer).State = EntityState.Deleted;
                if (searchCareer == null){
                    queryResponse.success = false;
                    queryResponse.Msg = "This career does not exist";
                    queryResponse.ErrorCode = "career_id_no_exist";
                    return queryResponse;
                }
                //career.Where(c => true);
                career.Remove(searchCareer);
                
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully removed career of CareerId = '{CareerId}'";
                CareerData? newCareerData = null;
                if (CareerId.Equals(selectedCareerId))
                    newCareerData = null;//await selectNewCareerData(requestUserId, queryResponse.requestUsername, queryResponse.requestUsername, null);
                if (newCareerData != null){
                    queryResponse.entity = newCareerData;
                    queryResponse.requestUserMatchesTarget = true;
                }
                
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unkown";
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> RemoveSeason(Guid requestUserId, Guid seasonId)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                bool seasonExists = await season.Where(s => s.SeasonId.Equals(seasonId) && s.user_id.Equals(requestUserId)).AnyAsync();
                if (!seasonExists)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "This season does not exist";
                    queryResponse.ErrorCode = "season_id_no_exist";
                    return queryResponse;
               }
               season.Remove(new Season{
                SeasonId = seasonId,
                user_id = requestUserId,

               });
               await SaveChangesAsync();
               queryResponse.success = true;
               queryResponse.Msg = $"Successfully removed season of SeasonId = '{seasonId}'";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unknown";
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> RemoveCompetitionFormat(Guid requestUserId, string name)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                int affectedRows = await this.Database.ExecuteSqlInterpolatedAsync($"delete from competition_format where `user_id`={queryResponse.requestUserId} AND `Name`={name}");
                if (affectedRows < 1)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "This competition format does not exist";
                    queryResponse.ErrorCode = "format_name_no_exist";
                    return queryResponse;
                }
                affectedRows = await this.Database.ExecuteSqlInterpolatedAsync($"update competition set `FormatName`=null where `user_id`={queryResponse.requestUserId} AND `FormatName`={name}");
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully removed format of the name '{name}'";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unknown";
            }
            return queryResponse;
        }
        public async Task<MySqlResponse> RemoveCompetition(Guid requestUserId, Guid competitionId)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try{
                bool competitionExists = await competition.Where(c => c.user_id.Equals(requestUserId) && c.CompetitionId.Equals(competitionId)).AnyAsync();
                if (!competitionExists)
                {
                    queryResponse.success = false;
                    queryResponse.Msg = "This competition does not exist";
                    queryResponse.ErrorCode = "competition_id_no_exist";
                    return queryResponse;
                }
                competition.Remove(new Competition{
                    CompetitionId = competitionId,
                    user_id = requestUserId
                });
                await SaveChangesAsync();
                queryResponse.success = true;
                queryResponse.Msg = $"Successfully removed competition of CompetitionId = '{competitionId}'";
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.success = false;
                queryResponse.Msg = "An error has occured";
                queryResponse.ErrorCode = "error_unknown";
            }
            return queryResponse;
        }

        public async Task<MySqlResponse> RemoveResult(Guid requestUserId, Guid resultId)
        {
            MySqlResponse queryResponse = await InitCrudQuery(new MySqlResponse(), requestUserId);
            if (queryResponse.requestUserId == null)
                return queryResponse;
            try
            {
                int affectedRows = await this.Database.ExecuteSqlInterpolatedAsync($"call remove_result({requestUserId}, {resultId})");
                if (affectedRows == 0)
                {
                    queryResponse.doFailure("global", "The result never existed", "result_id_no_exist");
                    return queryResponse;
                }
                queryResponse.success = true;
            } catch (Exception e)
            {
                _logger.CLogError(e.Message);
                queryResponse.defaultError();
            }
            return queryResponse;
        }

        /*private async Task<CareerData?> selectNewCareerData(Guid requestUserId, string requestUsername, string pageUsername, Guid? selectedCareerId){ // for when user removes a career/seaon and needs a new one sent to them
            MySqlFetchResponse<CareerData> queryResponse = await fetchCareerData(new DataRequestTransfer{
                RequestUser = new UserTransfer
                {
                    user_id = requestUserId,
                    Username = requestUsername,
                },
                username = pageUsername,
                CareerId = selectedCareerId,
            });
            if (queryResponse.success)
                return queryResponse.entity;
            return null;
        } */
        public async Task<MySqlFetchResponse<CareerData>> fetchCareerData(DataRequestTransfer data)
        {
            MySqlFetchResponse<CareerData> queryResponse = new MySqlFetchResponse<CareerData>();
            MySqlFetchResponse<User> specificUserQuery = await GetSpecificUser(data.username);
            if (!specificUserQuery.success)
            {
                queryResponse.fromOtherResponse(specificUserQuery);
                return queryResponse;
            }
            User fetchUser = specificUserQuery.entity;
            
            IQueryable<User> queryThatUser = user.Where(u => u.user_id.Equals(fetchUser.user_id))
                .Include(u => u.careers)
                .ThenInclude(c => c.seasons.Where(s => s.CareerId.Equals(data.CareerId)))
                .ThenInclude(s => s.competitions.Where(c => c.SeasonId.Equals(data.SeasonId)))
                .ThenInclude(c => c.results).AsSplitQuery()
                .Include(u => u.competitionFormats.Where(cf => cf.user_id.Equals(fetchUser.user_id))).AsSplitQuery();
            User theUser = await queryThatUser.SingleAsync();

            List<string> teamNames = await result.Where(r => r.user_id.Equals(fetchUser.user_id)).Select(r => r.OppTeam).Distinct().ToListAsync();
            _logger.CLogDebug(JsonSerializer.Serialize(teamNames));
            //_logger.CLogDebug(queryThatUser.ToQueryString());
                //.SingleAsync();
            

            /*_logger.CLogDebug("User below");
            _logger.CLogDebug(theUser.ToString());*/
            /*_logger.CLogDebug("Their careers");
            _logger.CLogDebug($"\n{theUser.careers.AsListString()}");
            Console.WriteLine();
            _logger.CLogDebug("Their Seasons");
            //_logger.CLogDebug($"\n{theUser.careers[0]}")*/
            CareerData userData = theUser.ToCareerData();
            userData.teamNames = teamNames;
            Career? selectedCareer = userData.careers.Find(c => c.CareerId.Equals(data.CareerId));
            Season? selectedSeason = userData.seasons.Find(s => s.SeasonId.Equals(data.SeasonId));
            if (!theUser.PublicAccount && (data.RequestUser == null || !data.RequestUser.user_id.Equals(theUser.user_id)))
            {
                queryResponse.doFailure("global", "This account is private", "userpage_unauthorized");
            }
            /*else if (data.CareerId != null && selectedCareer == null)
            {
                queryResponse.success = false;
                queryResponse.ErrorCode = "careerid_no_exist";
                queryResponse.Msg = "This career does not exist";
                queryResponse.doFailure("global", "This career does not exist", "careerid_no_exist");
            } else if (data.SeasonId != null && selectedSeason == null)
            {
                queryResponse.success = false;
                queryResponse.ErrorCode = "seasonid_no_exist";
                queryResponse.Msg = "This season does not exist";
                queryResponse.doFailure("global", "This season does not exist", "seasonid_no_exist");
            }*/
            else
            {
                //CareerData userData = theUser.ToCareerData();
                userData.SelectedCareerId = data.CareerId;
                userData.SelectedSeasonId = data.SeasonId;
                userData.Username = data.username;
                if (data.RequestUser != null && data.RequestUser.user_id.Equals(fetchUser.user_id))
                    queryResponse.requestUserMatchesTarget = true;              
                queryResponse.entity = userData;
                queryResponse.success = true;
            }
            return queryResponse;
        }

        public async Task Testing(ResultResponse response)
        {
            await InsertRandomUser(); return;
            //Guid uid = new Guid("9ec09218-45b2-463d-a1bf-1641625b537b");
            /*List<string> teamNames = await result.Where(r => r.user_id.Equals(uid)).Select(r => r.OppTeam).Distinct().ToListAsync();
            _logger.CLogDebug(JsonSerializer.Serialize(teamNames));*/
            // Utility.LogInfo(_logger, users[0].careers.Count.ToString()); // does not list related careers
        }

        public async Task<MySqlResponse> FetchAllData(AllDataResponse response)
        {
            MySqlResponse queryResponse = new MySqlResponse();
            response.users = await user.ToListAsync();
            response.careers = await career.ToListAsync();
            response.seasons = await season.ToListAsync();
            response.competitions = await competition.ToListAsync();
            response.competition_formats = await competition_format.ToListAsync();
            response.results = await result.ToListAsync();
            return queryResponse;
        }

        public async Task UploadCareerData(CareerData cData){
            career.AddRange(cData.careers);
            season.AddRange(cData.seasons);
            competition.AddRange(cData.competitions);
            result.AddRange(cData.results);
            competition_format.AddRange(cData.competition_formats);
            await SaveChangesAsync();
        }
    }
}
