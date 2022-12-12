drop procedure if exists add_result;
delimiter //
create procedure add_result (IN _ResultId char(36), IN _user_id char(36), IN _GoalsFor tinyint, IN _GoalsAgaints tinyint, IN _OppTeam varchar(32), IN _Home tinyint(1), IN _Replay tinyint(1), IN _CompetitionId char(36))
BEGIN
	set @count = (select count(*) from result as r where r.user_id=_user_id and r.CompetitionId=_CompetitionId);
    insert into result (`ResultId`, `user_id`, `Position`, `GoalsFor`, `GoalsAgaints`, `OppTeam`, `Home`, `Replay`, `CompetitionId`) values 
    (_ResultId, _user_id, @count+1, _GoalsFor, _GoalsAgaints, _OppTeam, _Home, _Replay, _CompetitionId);
    select * from result as r where r.user_id=_user_id and r.ResultId=_ResultId; 
END//

/*call add_result ("6cea8bc3-fb25-4643-addd-de9daee29469", "352e30a4-ea62-4d79-abfa-78354bd23c8e", 3, 0, "Crystal Palace", 1, 0, "3436279a-2004-4a24-8944-68aad133a50a");

call add_result('c05fc72e-e1e2-45aa-a5bc-f9705a122c0c', '352e30a4-ea62-4d79-abfa-78354bd23c8e', 1, 2, 'abc', True, False, '3436279a-2004-4a24-8944-68aad133a50a');*/

call add_result('c05fc72e-e1e2-45aa-a5bc-f9704a122c0c', '352e30a4-ea62-4d79-abfa-78354bd23c8e', 1, 2, 'Called', True, False, '3436279a-2004-4a24-8944-68aad133a50a');