using ResultsNet.Entities;
using ResultsNet.TransferObjects;

namespace ResultsNet.ApiResponse
{
    public class CareerDataResponse : ResultResponse
    {
        public CareerData careerData {get; set;}
        public bool hasPermissionToEdit {get; set;} = false;
        public CareerDataResponse()
        {

        }

        public CareerDataResponse(ResultResponse r) : base(r)
        {
            
        }

    }
}