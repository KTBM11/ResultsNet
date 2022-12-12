using System.Text.Json.Serialization;

namespace ResultsNet.Entities{
    public class CompetitionFormat{
        public Guid user_id {get; set;}
        public string Name {get; set;}
        public string Position {get; set;}
        public string Output {get; set;}
        [JsonIgnore]
        public User user {get; set;}

        public override string ToString()
        {
            return $"{{user_id: \"{user_id.ToString()}\", Name: \"{Name}\", Position: \"{Position}\", Output: \"{Output}\"}}";
        }
    }

}