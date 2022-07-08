-- Create production express-session data store table
CREATE TABLE [Session]
(
  SessionID nvarchar(450) not null primary key,
  SessionData nvarchar(max) null,
  LastTouchedUtc datetime not null  
)