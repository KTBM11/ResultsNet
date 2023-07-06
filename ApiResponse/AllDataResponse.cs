using ResultsNet.Entities;

namespace ResultsNet.ApiResponse
{
    public class AllDataResponse : ResultResponse // development purposes class
    {
        public List<User> users {get; set;} = new List<User>();
        public List<Career> careers {get; set;} = new List<Career>();
        public List<Season> seasons {get; set;} = new List<Season>();
        public List<Competition> competitions {get; set;} = new List<Competition>();
        public List<CompetitionFormat> competition_formats {get; set;} = new List<CompetitionFormat>();
        public List<Result> results {get; set;} = new List<Result>(); 
    }
}