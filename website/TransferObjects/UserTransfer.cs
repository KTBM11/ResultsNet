using System.Text.RegularExpressions;
using ResultsNet.ApiResponse;
using ResultsNet.Custom;
using ResultsNet.Entities;
using ResultsNet.Custom;

namespace ResultsNet.TransferObjects{
    public class UserTransfer : SuperTranfer{
        public Guid? user_id {get; set;}
        public string Username {get; set;}
        public string Password {get; set;}

        public User ToNewUser ()
        {
            Password passwordHash = Utility.CreatePasswordHash(Password);
            Console.WriteLine($"Password Hash length: {passwordHash.PasswordHash.Length}\nPassword Salt: {passwordHash.PasswordSalt.Length}");
            return User.NewUser(Username, Password, passwordHash.PasswordHash, passwordHash.PasswordSalt);
        }

        public override ErrorCollection GetClientErrors()
        {
            ErrorCollection errors = new ErrorCollection();
            ConfigModel config = Custom.Utility.sharedConfig;
            Regex? usernameRegex = Utility.getConfigRegex(config.username_expression);
            Regex? passwordRegex = Utility.getConfigRegex(config.password_expression);
            if (Username.Length < config.username_minlength || Username.Length > config.username_maxlength)
            {
                errors.AddError("login-username", new Error($"Username must be between {config.username_minlength} and {config.username_maxlength} characters", "username_incorrect_length"));
            }
            if (usernameRegex != null && !usernameRegex.Match(Username).Success)
            {
                errors.AddError("login-username", new Error(config.username_format_message, "username_format_mismatch"));
            }
            if (Password.Length < config.password_minlength || Password.Length > config.password_maxlength)
            {
                errors.AddError("login-password", new Error($"Password must be between {config.password_minlength} and {config.password_maxlength} chracters", "password_incorrect_length"));   
            }
            if (passwordRegex != null && !passwordRegex.Match(Password).Success)
            {
                errors.AddError("login-password", new Error(config.password_format_message, "password_format_mismatch"));
            }
            return errors;
        }
    }
}