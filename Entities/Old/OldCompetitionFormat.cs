namespace ResultsNet.Entities.Old
{
    public class OldCompetitionFormat
    {
        public string name {get; set;}
        public string position {get; set;}
        public string output {get; set;}

        public CompetitionFormat ToNewCompetitionFormat(Guid user_id){
            return new CompetitionFormat
            {
                user_id = user_id,
                Name = name,
                Position = position,
                Output = output,
            };
        }
    }
}