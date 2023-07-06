using System.Collections;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;
using ResultsNet.Entities;
using ResultsNet.TransferObjects;

namespace ResultsNet.Custom{
    public static class Utility // provide functions that may be used by any class
    {
        private static IConfiguration configuration;
        private static ILogger _logger;
        public static Random random = new Random();
        public static void SetConfiguration(IConfiguration c)
        {
            configuration = c;
        }

        public static void SetLogger(ILogger logger)
        {
            _logger = logger;
        }

        public static ILogger GetLogger(){
            return _logger;
        }
        //static string config = File.ReadAllText("./ClientApp/src/SharedConfig.json");
        static string config = File.ReadAllText("./SharedConfig.json");
        public static void printConfig(){
            Console.WriteLine(config);
        }
        public static ConfigModel sharedConfig = JsonSerializer.Deserialize<ConfigModel?>(config);

        /*public static ConfigModel? getConfig(){
            ConfigModel? configModel = JsonSerializer.Deserialize<ConfigModel>(config);
            return configModel;
        }*/
        public static Regex? getConfigRegex(string? regex)
        {
            try{
                return new Regex(regex);
            } catch (Exception e){
                if (regex != null)
                    _logger.CLogDebug("Error parsing regex");
            }
            return null;
        }

        private static string logString(string msg)
        {
            return $"[{DateTime.UtcNow.ToLongTimeString()}] {msg}\n";
        }
        public static void CLogInfo(this ILogger logger, string msg){
            logger.LogInformation(logString(msg));
        }

        public static void CLogDebug(this ILogger logger, string msg){
            logger.LogDebug(logString(msg));
        }

        public static void CLogError(this ILogger logger, string msg)
        {
            logger.LogError(logString(msg));
        }

        public static bool isInt(this string? num){
            try{
                int.Parse(num);
                return true;
            } catch(Exception e){
                return false;
            }
        }

        public static Password CreatePasswordHash(string password)
        {
            var hmac = new HMACSHA512();
            byte[] salt = hmac.Key;
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return new Password(hash, salt);
        }

        public static bool VerifyPasswordHash(string checkPassword, Password password)
        {
            var hmac = new HMACSHA512(password.PasswordSalt);
            byte[] computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(checkPassword));
            return computedHash.SequenceEqual(password.PasswordHash);
        }

        public static string CreateToken(User user)
        {
            int token_expires = (Custom.Utility.sharedConfig.token_expires != null) ? (int) Custom.Utility.sharedConfig.token_expires : 90;
            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("Auth:key").Value));
            SecurityTokenDescriptor descripter = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim("id", user.user_id.ToString()),
                    new Claim("username", user.Username)
                }),
                Expires = DateTime.Now.AddHours(token_expires),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature)
            };
            SecurityToken token = handler.CreateToken(descripter);
            return handler.WriteToken(token);
        }

        /*public static Guid? ValidateToken(string token)
        {
            if (token == null)
                return null;
            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("Auth:key").Value));
            TokenValidationParameters tokenValidation = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            try{
                handler.ValidateToken(token, tokenValidation, out SecurityToken validatedToken);
                JwtSecurityToken jwtToken = (JwtSecurityToken) validatedToken;
                Console.WriteLine(jwtToken.Claims.First(x => x.Type == "id").Value);
                Guid user_id = new Guid(jwtToken.Claims.First(x => x.Type == "id").Value);
                return user_id;
            } catch {
                return null;
            }
        }*/

        public static UserTransfer? ValidateToken(string token)
        {
            if (token == null)
                return null;
            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("Auth:key").Value));
            TokenValidationParameters tokenValidation = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            try{
                handler.ValidateToken(token, tokenValidation, out SecurityToken validatedToken);
                JwtSecurityToken jwtToken = (JwtSecurityToken) validatedToken;
                Guid user_id = new Guid(jwtToken.Claims.First(x => x.Type == "id").Value);
                string username = jwtToken.Claims.First(x => x.Type == "username").Value.ToString();
                return new UserTransfer{
                    user_id = user_id,
                    Username = username,
                };
            } catch (Exception e){
                Console.WriteLine(e.Message);
                return null;
            }
        }

        public static void printList<T>(List<T> list){

            //Console.WriteLine("---------- PRINTING LIST ----------");
            for (int i = 0; i < list.Count; i++){
                Console.WriteLine($"{i}. {list[i].ToString()}");
            }
           // Console.WriteLine("---------- ENDING LIST PRINT ----------");
            Console.WriteLine();
            Console.WriteLine();
            Console.WriteLine();
        }

        public static string AsListString<T>(this List<T> list)
        {
            string s = "";
            for (int i = 0; i < list.Count; i++){
                s += $"{i}. {list[i].ToString()}\n";
            }
            return s;
        }

        public static string AsArrayString<T>(this List<T> list)
        {
            string s = "[";
            for (int i = 0; i < list.Count; i++)
            {
                s += $"{list[i].ToString()}{(i == list.Count - 1 ? "" : ", ")}";
            }
            s += "]";
            return s;
        }

        private static string AsArrayString2<T>(this List<T> list)
        {
            string s = "[";
            for (int i = 0; i < list.Count; i++)
            {
                s += $"{list[i].ToJsonString()}{(i == list.Count - 1 ? "" : ", ")}";
            }
            s += "]";
            return s;
        }

        public static T GetRandom<T>(this List<T> list)
        {
            return list[random.Next(list.Count)];
        }

        public static string ToJsonString <T>(this T? obj)
        {
            if (obj == null)
                return "null";
            Type type = obj.GetType();
            if (type.IsPrimitive || type.Name.Equals("String") || type.Name.Equals("Guid"))
                return obj.ToString();
            else if (obj is IList)
                return AsArrayString2((obj as IList).Cast<object>().ToList());

            bool quoteFieldName = true;
            PropertyInfo[] propertyInfo  = type.GetProperties();
            string jsonString = "{";
            for (int i = 0; i < propertyInfo.Length; i++)
            {
                PropertyInfo pInfo = propertyInfo[i];
                string propertyName = propertyInfo[i].Name;
                string comma = i == propertyInfo.Length - 1 ? "" : ", ";
                string quotes = pInfo.PropertyType.Name == "String" ? "\"" : "";
                string qf = quoteFieldName ? "\"" : "";
                string newJson;
                object? pValue = pInfo.GetValue(obj);
                string jsonValue = pValue.ToJsonString();
                /*if (pValue == null){
                    jsonValue = "null";
                }
                else if (pValue is IList)
                {
                    _logger.CLogError("THIS GOT CALLED???");
                    _logger.LogCritical(pValue.ToString());
                    List<object> newList = (pValue as IList).Cast<object>().ToList();
                    jsonValue = AsArrayString2(newList);
                } else if (pInfo.PropertyType.IsPrimitive || pInfo.PropertyType.Name.Equals("String")){
                    jsonValue = pValue.ToString();
                }*/
                newJson = $"{qf}{pInfo.Name} ({pInfo.PropertyType.Name}){qf}: {quotes}{jsonValue}{quotes}{comma}";
                //newJson = $"{qf}{pInfo.Name}{qf}: {quotes}{jsonValue}{quotes}{comma}";
                jsonString += newJson;
            }
            jsonString += "}";
            return jsonString;
        }
    }
}