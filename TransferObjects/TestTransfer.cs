using ResultsNet.ApiResponse;

namespace ResultsNet.TransferObjects{
    public class TestTransfer{
        public string TestString {get; set;}
        public int TestNumber {get; set;}
        public bool IsTrue {get; set;}
        public List<int> TestList {get; set;}
        public List<List<int>> inception {get; set;}
        public Error err {get; set;}

        public Guid guid {get; set;}
    }
}