select * from user;
select * from career;
select * from season;
select * from competition;
select * from competition_format;
select * from result;
#SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
select count(*) from result as r where r.user_id='352e30a4-ea62-4d79-abfa-78354bd23c8e' and r.CompetitionId="3436279a-2004-4a24-8944-68aad133a50a";

select oppteam, user_id, position from result where user_id = "9ec09218-45b2-463d-a1bf-1641625b537b" group by OppTeam;
select * from result as r inner join (select distinct oppteam from result) as d on r.OppTeam = d.OppTeam;
select * from (select distinct resultId, oppteam from result) d join result r on d.resultid = r.resultid and d.oppteam=r.oppteam;
select * from result r1 join result r2 on r1.oppteam = r2.oppteam;

set sql_mode = '';
set sql_mode = 'ONLY_FULL_GROUP_BY';
select resultid, user_id, position, goalsfor, goalsagaints, oppteam, home, replay, created, competitionid from result group by oppteam order by oppteam;
select count(distinct oppteam) from result;
#resultid, user_id, position, goalsfor, goalsagaints, oppteam, home, replay, created, competitionid, 

#SELECT list is not in GROUP BY clause and contains nonaggregated column 'resultsnetdb.result.Position' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
