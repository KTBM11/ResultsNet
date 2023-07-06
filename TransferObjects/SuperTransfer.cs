using ResultsNet.ApiResponse;

namespace ResultsNet.TransferObjects
{
    public abstract class SuperTranfer{
        public virtual Guid? SelectedCareerId {get; set;}
        public Guid? SelectedSeasonId {get; set;}

        public virtual ErrorCollection GetClientErrors()
        {
            return new ErrorCollection();
        }
    }
}