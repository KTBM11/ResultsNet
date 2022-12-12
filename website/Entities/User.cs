using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using ResultsNet.Custom;
using ResultsNet.TransferObjects;

namespace ResultsNet.Entities
{
    public class User

    {
        public Guid user_id {get; set;}
        [Column(TypeName="varchar(32)")]
        public string Username {get; set;}
        /*[Column(TypeName="varchar(32)")]
        public string Password {get; set;}*/
        [Column(TypeName="blob(64)")]
        [JsonIgnore]
        public byte[] PasswordHash {get; set;}
        [Column(TypeName="blob(128)")]
        [JsonIgnore]
        public byte[] PasswordSalt {get; set;}

        public bool PublicAccount {get; set;}
        public DateTime Created {get; set;}
        public List<Career> careers {get; set;} = new List<Career>();
        public List<CompetitionFormat> competitionFormats {get; set;} = new List<CompetitionFormat>();
        

        public static User NewUser(string username, string password, byte[] PasswordHash, byte[] PasswordSalt)
        {
            Guid id = Guid.NewGuid();
            return new User{
                user_id=id,
                Username=username,
                //Password=password,
                PasswordHash=PasswordHash,
                PasswordSalt=PasswordSalt,
                careers=new List<Career>(),
            };
        }

        public override string ToString()
        {
            return $"{{user_id: \"{user_id}\", Username: \"{Username}\", PasswordHash: \"{PasswordHash}\", PasswordSalt: \"{PasswordSalt}\", careers: {careers.AsArrayString()}, competitionFormats: {competitionFormats.AsArrayString()}}}";
        }

        public CareerData ToCareerData()
        {
            CareerData data = new CareerData();
            data.careers = careers;
            data.competition_formats = competitionFormats;
            data.PublicAccount = this.PublicAccount;
            int selectedCareerIndex = careers.FindIndex(c => c.seasons.Count > 0);
            Console.WriteLine("IS THIS RUNNING 1...");
            if (selectedCareerIndex != -1){
                data.seasons = careers[selectedCareerIndex].seasons;
                int selectedSeasonIndex = data.seasons.FindIndex(s => s.competitions.Count > 0);
                Console.WriteLine("IS THIS RUNNING 2...");
                if (selectedSeasonIndex != -1)
                {
                    Console.WriteLine("IS THIS RUNNING 3...");
                    Season selectedSeason = data.seasons[selectedSeasonIndex];

                    data.competitions = selectedSeason.competitions;
                    for (int i = 0; i < data.competitions.Count; i++)
                    {
                        data.results.AddRange(data.competitions[i].results);
                    }
                }
            }
            return data;
        }

        public static User Random()
        {
            User user = new User();
            user.user_id = Guid.NewGuid();
            user.Username = $"{RandomEntities.Usernames.GetRandom()}_{RandomEntities.Usernames.GetRandom()}";
            Password password = Utility.CreatePasswordHash("StandardPassword");
            user.PasswordHash = password.PasswordHash;
            user.PasswordSalt = password.PasswordSalt;
            for (int i = 0; i < Utility.random.Next(1, 6); i++)
            {
                user.careers.Add(Career.Random(user));
            }
            
            return user;
        }
    }
}