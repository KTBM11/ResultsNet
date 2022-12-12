drop procedure if exists unique_team_names;
delimiter //
create procedure unique_team_names (IN _user_id char(36))
BEGIN
	set sql_mode = '';
    /*set sql_mode = 'ONLY_FULL_GROUP_BY';*/
    select resultid, user_id, position, goalsfor, goalsagaints, oppteam, home, replay, created, competitionid from result r where r.user_id=_user_id group by oppteam order by oppteam;
END//
delimiter ;

call unique_team_names("9ec09218-45b2-463d-a1bf-1641625b537b");