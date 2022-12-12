drop procedure if exists shift_result;
delimiter //
create procedure shift_result(IN _user_id char(36), IN _ResultId char(36), IN _newPosition tinyint)
BEGIN
	set @compid = (select CompetitionId from result where user_id=_user_id and ResultId=_ResultId);
	set @currentPosition = (select Position from result where user_id=_user_id and ResultId=_ResultId); #2
    set @count = (select count(*) from result where user_id=_user_id and CompetitionId=@compid); #2
    set @newPosition = least(greatest(1, _newPosition), @count); #1
    set @diff = @currentPosition - @newPosition; #1
    set @offset = (select if(@diff=0, 0, (@diff) / abs(@diff))); #1
    update result set Position = Position + @offset where user_id=_user_id and CompetitionId = @compid and (Position between @currentPosition and @newPosition or Position between @newPosition and @currentPosition);
	update result set Position = @newPosition where user_id=_user_id and ResultId=_ResultId;
    select @newPosition;
END//

delimiter ;

# ResultId, user_id, Position, GoalsFor, GoalsAgaints, OppTeam, Home, Replay, Created, CompetitionId
#'8404557b-733b-4ba2-9fd5-56e6352cfd4d', '9ec09218-45b2-463d-a1bf-1641625b537b', '1', '1', '1', 'lol', '1', '0', '2022-11-19 04:10:20.000000', '64330a3b-316b-4863-9806-60a931cc1e56'

call shift_result('9ec09218-45b2-463d-a1bf-1641625b537b', '71186687-9eda-47e5-be6e-2da79d26307f', 10);

update result set Position = 11 where ResultId = "8404557b-733b-4ba2-9fd5-56e6352cfd4d";