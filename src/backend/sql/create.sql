create table users(
    id serial primary key,
    username varchar not null unique,
    share_progress varchar,
    avatar_filename varchar
);

create table notes(
    id serial,
    _user integer not null,
    text varchar,
    date timestamp not null,
    primary key (id, _user),
    foreign key (_user) references users(id) on delete cascade
);

create table batches(
    id serial,
    _user integer not null,
    start_date timestamp not null,
    _level integer not null,
    primary key (id, _user),
    foreign key (_user) references users(id) on delete cascade
);

create table goals(
    _batch integer not null,
    _user integer not null,
    goal_day integer not null,
    _name varchar not null,
    conclusion_date timestamp,
    primary key (_user, _batch, goal_day, _name),
    foreign key (_batch, _user) references batches(id, _user) on delete cascade
);