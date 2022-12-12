drop procedure if exists remove_result;

delimiter //
create procedure remove_result (IN uid char(36),IN id char(36))
BEGIN
	set @compid = (select CompetitionId from result where user_id=uid and ResultId=id);
    set @pos = (select Position from result where ResultId=id);
    update result set Position=Position-1 where user_id=uid and CompetitionId=@compid and Position > @pos;
    delete from result where @compid is not null and user_id=uid and `ResultId` = id;
END//

call remove_result("352e30a4-ea62-4d79-abfa-78354bd23c8e", "fc3e932c-e8a5-4930-a193-b8bc3b301d1a");

remove_result "abc", "123";Error Code: 1064. You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ', IN Home int, IN Replay int, IN CompetitionId char) BEGIN  set @count  = (selec' at line 1
