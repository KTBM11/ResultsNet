select * from user;
select * from career;
select * from season;

drop table user;
drop table career;
drop table season;
drop table competition;

create table user(
	user_id varchar(36) primary key
);

create table career(
	CareerId varchar(36),
    user_id varchar(36),
    constraint pk_career primary key(CareerId, user_id),
    constraint fk_user_career foreign key(user_id) references user(user_id) on delete cascade
);

create table season(
	SeasonId varchar(36),
    user_id varchar(36),
    CareerId varchar(36),
    constraint pk_season primary key(SeasonId, user_id),
    constraint fk_career_season foreign key (CareerId, user_id) references career(CareerId, user_id) on delete cascade
);

create table competition(
	CompetitionId varchar(36),
    user_id varchar(36),
    SeasonId varchar(36),
    constraint pk_competition primary key(CompetitionId, user_id),
    constraint fk_season_competition foreign key (SeasonId, user_id) references season(SeasonId, user_id) on delete cascade
);

insert into user values ("user_abc");
insert into career values ("career_abc", "user_abc");
insert into season values ("season_abc", "user_abc", "career_abc");
delete from career;
delete from user where user_id = "user_abc";