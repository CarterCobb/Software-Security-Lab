-- The User table
CREATE TABLE [User] (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VarChar(450) NOT NULL UNIQUE,
    [Password] VarChar(MAX) NOT NULL
);
GO

-- Add some test users (Example only DO NOT run this)
-- INSERT INTO [User] VALUES ('ccobb', '<hashed password>');
-- INSERT INTO [User] VALUES ('ccobb72', '<hashed password>');