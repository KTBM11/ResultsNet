using ResultsNet.Entities;

namespace ResultsNet.TransferObjects
{
    public class CareerData : SuperTranfer
    {
        public Guid? SelectedCareerId {get; set;}
        public Guid? SelectedSeasonId {get; set;}
        public string Username {get; set;}
        public bool PublicAccount {get; set;}
        public List<Career> careers {get; set;} = new List<Career>();
        public List<Season> seasons {get; set;} = new List<Season>();
        public List<Competition> competitions {get; set;} = new List<Competition>();
        public List<CompetitionFormat> competition_formats {get; set;} = new List<CompetitionFormat>();
        public List<Result> results {get; set;} = new List<Result>();
        public List<string> teamNames {get; set;} = new List<string>();
    }
}