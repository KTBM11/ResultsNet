using ResultsNet.TransferObjects;

namespace ResultsNet.Entities.Old
{
    public class OldData
    {
        public List<OldCareer> oldCareers {get; set;}
        public List<OldSeason> oldSeasons {get; set;}
        public List<OldCompetition> oldCompetitions {get; set;}
        public List<OldResult> oldResults {get; set;}
        public List<OldCompetitionFormat> oldCompetitionFormats {get; set;}

        public CareerData ToCareerData(Guid user_id)
        {   
            CareerData cData = new CareerData();
            DateTime time = DateTime.UtcNow;
            foreach (OldCareer oldCareer in oldCareers)
            {
                Career newCareer = oldCareer.ToNewCareer(user_id, DateTime.UtcNow.AddMinutes(oldCareer.career_id));
                cData.careers.Add(newCareer);
                foreach (OldSeason oldSeason in oldSeasons)
                {
                    if (oldSeason.career_id != oldCareer.career_id) continue;
                    Season newSeason = oldSeason.ToNewSeason(user_id, newCareer.CareerId, DateTime.UtcNow.AddMinutes(oldSeason.season_id));
                    cData.seasons.Add(newSeason);
                    foreach (OldCompetition oldCompetition in oldCompetitions)
                    {
                        if (oldCompetition.season_id != oldSeason.season_id) continue;
                        Competition newCompetition = oldCompetition.ToNewCompetition(user_id, newSeason.SeasonId, DateTime.UtcNow.AddMinutes(oldCompetition.competition_id));
                        cData.competitions.Add(newCompetition);
                        foreach (OldResult oldResult in oldResults)
                        {
                            if (oldResult.competition_id != oldCompetition.competition_id) continue;
                            Result newResult = oldResult.ToNewResult(user_id, newCompetition.CompetitionId);
                            cData.results.Add(newResult);
                        }
                    }
                }
            }
            foreach (OldCompetitionFormat oldFormat in oldCompetitionFormats)
            {
                CompetitionFormat newFormat = oldFormat.ToNewCompetitionFormat(user_id);
                cData.competition_formats.Add(newFormat);
            }

            return cData;
        }
    }
}