using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using ResultsNet.Custom;

namespace ResultsNet.Entities{
    public class Career{
        public Guid CareerId {get; set;}
        [Column(TypeName="varchar(32)")]
        public string Name {get; set;}
        public Guid user_id {get; set;}
        public DateTime Created {get; set;}
        [JsonIgnore]
        public User user {get; set;}
        [JsonIgnore]
        public List<Season> seasons {get; set;} = new List<Season>();
        public static Career NewCareer(string name, Guid user_id){
            return new Career{
                CareerId=Guid.NewGuid(),
                Name=name,
               // user_id=user_id
            };
        }

        public override string ToString()
        {
            return $"{{CareerId: \"{CareerId.ToString()}\", Name: \"{Name}\", user_id: \"{user_id.ToString()}\", seasons: {seasons.AsArrayString()}}}";
        }

        public static Career Random(User user)
        {
            Career career = new Career();
            career.CareerId = Guid.NewGuid();
            career.Name = RandomEntities.CareerNames.GetRandom();
            career.user_id = user.user_id;
            career.user = user;
            string teamName = RandomEntities.TeamNames.GetRandom();
            for (int i = 0; i < Utility.random.Next(1, 6); i++)
            {
                career.seasons.Add(Season.Random(career, i, teamName));
            }
            return career;
        }
    }
}