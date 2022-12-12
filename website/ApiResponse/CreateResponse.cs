namespace ResultsNet.ApiResponse{
    public class CreateResponse : ResultResponse
    {
        public Guid? InsertId {get; set;}
        public DateTime? InsertTime {get; set;}

        public CreateResponse(){

        }

        public CreateResponse(ResultResponse r) : base(r)
        {

        }
    }
}