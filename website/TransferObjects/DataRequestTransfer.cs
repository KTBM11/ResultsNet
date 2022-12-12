namespace ResultsNet.TransferObjects
{
    public class DataRequestTransfer
    {
        public UserTransfer? RequestUser {get; set;} // user requesting to view page
        public string username {get; set;} // username of page owner
        public Guid? CareerId {get; set;}
        public Guid? SeasonId{get; set;}
    }
}