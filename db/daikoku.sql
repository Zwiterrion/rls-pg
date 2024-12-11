-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL
);

-- 2. Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- 3. Team Memberships Table (Defines Roles)
CREATE TABLE team_memberships (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('api-administrator', 'api-consumer')),
    UNIQUE (user_id, team_id)
);

-- 4. APIs Table (Owned by Teams)
CREATE TABLE apis (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    UNIQUE (team_id, name)
);

-- 5. (Optional) Fine-Grained API Permissions Table
-- Only needed if permissions must be assigned at an API level.
CREATE TABLE api_permissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    api_id INT REFERENCES apis(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('api-administrator', 'api-consumer')),
    UNIQUE (user_id, api_id)
);


ALTER TABLE apis ENABLE ROW LEVEL SECURITY;

-- Allow API-Administrators to view, create, and edit APIs
CREATE POLICY api_administrator_policy ON apis
USING (
    EXISTS (
        SELECT 1
        FROM team_memberships tm
        WHERE tm.team_id = apis.team_id
          AND tm.user_id = current_user::INT
          AND tm.role = 'api-administrator'
    )
);

-- Allow API-Consumers to only view APIs
CREATE POLICY api_consumer_policy ON apis
USING (
    EXISTS (
        SELECT 1
        FROM team_memberships tm
        WHERE tm.team_id = apis.team_id
          AND tm.user_id = current_user::INT
          AND tm.role = 'api-consumer'
    )
);


INSERT INTO users (username, full_name)
VALUES 
('zwitty', 'Etienne ANNE'),
('cavy', 'Benji'),
('tarantino', 'Quentin');

INSERT INTO teams (name, description)
VALUES 
('Zobi Team', 'The Legit Team description');

INSERT INTO apis (team_id, name, description)
VALUES 
(1, 'Weather Zobi API', 'Provides weather data');

INSERT INTO team_memberships(user_id, team_id, role)
VALUES 
(1, 1, 'api-administrator'),
(2, 1, 'api-consumer'),
(3, 1, 'api-administrator');
