namespace ResultsNet.Entities{
    public class ConfigModel{
        public int? username_maxlength {get; set;}
        public int? username_minlength {get; set;}
        public string? username_expression {get; set;}
        public string? username_format_message {get; set;}

        public int? password_maxlength {get; set;}
        public int? password_minlength {get; set;}
        public string? password_expression {get; set;}
        public string? password_format_message {get; set;}

        public int? career_name_minlength {get; set;}
        public int? career_name_maxlength {get; set;}
        public string? career_name_expression {get; set;}
        public string? career_name_format_message {get; set;}

        public int? season_name_minlength {get; set;}
        public int? season_name_maxlength {get; set;}
        public string? season_name_expression {get; set;}
        public string? season_name_format_message {get; set;}

        public int? season_teamname_minlength {get; set;}
        public int? season_teamname_maxlength {get; set;}
        public string? season_teamname_expression {get; set;}
        public string? season_teamname_format_message {get; set;}

        public int? competition_format_name_minlength {get; set;}
        public int? competition_format_name_maxlength {get; set;}
        public string? competition_format_name_expression {get; set;}
        public string? competition_format_name_format_message {get; set;}
        public int? competition_format_position_minlength {get; set;}
        public int? competition_format_position_maxlength {get; set;}
        public string? competition_format_position_expression {get; set;}
        public string? competition_format_position_format_message {get; set;}
        public int? competition_format_output_minlength {get; set;}
        public int? competition_format_output_maxlength {get; set;}
        public string? competition_format_output_expression {get; set;}
        public string? competition_format_output_format_message {get; set;}

        public int? competition_name_minlength {get; set;}
        public int? competition_name_maxlength {get; set;}
        public string? competition_name_expression {get; set;}
        public string? competition_name_format_message {get; set;}
        public int? token_expires {get; set;}
        public object? this[string propertyName]
        {
            get {return this.GetType().GetProperty(propertyName).GetValue(this, null);}
        }
    }
}