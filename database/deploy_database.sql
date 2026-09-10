-- ============================================================================
-- L&D TRAINING PORTAL — DATABASE DEPLOYMENT SCRIPT
-- Target: Microsoft SQL Server 2014+ (Compatibility Level 120)
-- Version: 1.0.0
-- Date: 2026-09-09
-- ============================================================================
-- INSTRUCTIONS:
--   1. Connect to your SQL Server instance via SSMS
--   2. Run this entire script in a single execution
--   3. It will create a database 'LDTrainingPortal' if it doesn't exist
--   4. All objects use IF EXISTS checks for idempotent re-runs
-- ============================================================================

USE [master]
GO

-- ── Create Database ─────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'LDTrainingPortal')
BEGIN
    CREATE DATABASE [LDTrainingPortal]
    PRINT 'Database [LDTrainingPortal] created.'
END
ELSE
BEGIN
    PRINT 'Database [LDTrainingPortal] already exists.'
END
GO

USE [LDTrainingPortal]
GO

-- Set compatibility level to SQL Server 2014
ALTER DATABASE [LDTrainingPortal] SET COMPATIBILITY_LEVEL = 120
GO

-- ============================================================================
-- TABLES
-- ============================================================================

-- ── 1. Users ────────────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserId          INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeCode    NVARCHAR(50) NOT NULL,
        FullName        NVARCHAR(200) NOT NULL,
        Email           NVARCHAR(200) NOT NULL,
        PasswordHash    NVARCHAR(500) NOT NULL,
        Department      NVARCHAR(100) NOT NULL,
        [Role]          NVARCHAR(50) NOT NULL DEFAULT 'Employee',  -- 'Admin' or 'Employee'
        Initials        NVARCHAR(10) NOT NULL,
        IsActive        BIT NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt       DATETIME2(7) NULL,

        CONSTRAINT UQ_Users_EmployeeCode UNIQUE (EmployeeCode),
        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT CK_Users_Role CHECK ([Role] IN ('Admin', 'Employee'))
    )
    PRINT 'Table [dbo.Users] created.'
END
GO

-- ── 2. Training Modules ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.TrainingModules', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TrainingModules (
        ModuleId        INT IDENTITY(1,1) PRIMARY KEY,
        Title           NVARCHAR(300) NOT NULL,
        [Type]          NVARCHAR(20) NOT NULL,  -- 'Video' or 'PDF'
        [Description]   NVARCHAR(MAX) NULL,
        Duration        NVARCHAR(50) NULL,       -- Display string e.g. '12 min', '8 min read'
        DurationSeconds INT NULL,                -- Actual duration in seconds for videos
        ContentUrl      NVARCHAR(1000) NULL,     -- Video URL or PDF URL
        PosterUrl       NVARCHAR(1000) NULL,     -- Poster image for videos
        PolicyContent   NVARCHAR(MAX) NULL,      -- For PDF type: the policy text content
        IsActive        BIT NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt       DATETIME2(7) NULL,

        CONSTRAINT CK_Modules_Type CHECK ([Type] IN ('Video', 'PDF'))
    )
    PRINT 'Table [dbo.TrainingModules] created.'
END
GO

-- ── 3. Training Assignments ────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.TrainingAssignments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TrainingAssignments (
        AssignmentId    INT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT NOT NULL,
        ModuleId        INT NOT NULL,
        IsRequired      BIT NOT NULL DEFAULT 1,
        DueDate         DATE NULL,
        AssignedBy      INT NULL,
        AssignedAt      DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
        IsRecurring     BIT NOT NULL DEFAULT 0,
        RecurrenceIntervalDays INT NULL,
        IsActive        BIT NOT NULL DEFAULT 1,

        CONSTRAINT FK_Assignments_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Assignments_Module FOREIGN KEY (ModuleId) REFERENCES dbo.TrainingModules(ModuleId),
        CONSTRAINT FK_Assignments_AssignedBy FOREIGN KEY (AssignedBy) REFERENCES dbo.Users(UserId),
        CONSTRAINT UQ_Assignments_UserModule UNIQUE (UserId, ModuleId)
    )
    PRINT 'Table [dbo.TrainingAssignments] created.'
END
GO

-- ── 4. Training Progress ───────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.TrainingProgress', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TrainingProgress (
        ProgressId          INT IDENTITY(1,1) PRIMARY KEY,
        UserId              INT NOT NULL,
        ModuleId            INT NOT NULL,
        [Status]            NVARCHAR(20) NOT NULL DEFAULT 'NotStarted',  -- NotStarted, InProgress, Completed
        ResumeTimeSeconds   INT NOT NULL DEFAULT 0,
        MaxWatchedSeconds   INT NOT NULL DEFAULT 0,
        VideoWatchedPercent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        CompletedAt         DATETIME2(7) NULL,
        ConsentedAt         DATETIME2(7) NULL,
        CreatedAt           DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2(7) NULL,

        CONSTRAINT FK_Progress_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Progress_Module FOREIGN KEY (ModuleId) REFERENCES dbo.TrainingModules(ModuleId),
        CONSTRAINT UQ_Progress_UserModule UNIQUE (UserId, ModuleId),
        CONSTRAINT CK_Progress_Status CHECK ([Status] IN ('NotStarted', 'InProgress', 'Completed'))
    )
    PRINT 'Table [dbo.TrainingProgress] created.'
END
GO

-- ── 5. Recurring Training Config ───────────────────────────────────────────
IF OBJECT_ID(N'dbo.RecurringTrainingConfig', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RecurringTrainingConfig (
        ConfigId                INT IDENTITY(1,1) PRIMARY KEY,
        ModuleId                INT NOT NULL,
        RecurrenceIntervalDays  INT NOT NULL DEFAULT 90,
        IsActive                BIT NOT NULL DEFAULT 1,
        CreatedBy               INT NULL,
        CreatedAt               DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt               DATETIME2(7) NULL,

        CONSTRAINT FK_Recurring_Module FOREIGN KEY (ModuleId) REFERENCES dbo.TrainingModules(ModuleId),
        CONSTRAINT FK_Recurring_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId),
        CONSTRAINT UQ_Recurring_Module UNIQUE (ModuleId)
    )
    PRINT 'Table [dbo.RecurringTrainingConfig] created.'
END
GO

-- ── 6. Audit Log ───────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.AuditLog', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLog (
        LogId           BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT NULL,
        [Action]        NVARCHAR(100) NOT NULL,
        EntityType      NVARCHAR(100) NULL,
        EntityId        INT NULL,
        Details         NVARCHAR(MAX) NULL,   -- Plain text details (not JSON for 2014 compat)
        IpAddress       NVARCHAR(50) NULL,
        CreatedAt       DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_Audit_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    )
    PRINT 'Table [dbo.AuditLog] created.'
END
GO

-- ============================================================================
-- INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Assignments_UserId' AND object_id = OBJECT_ID(N'dbo.TrainingAssignments'))
    CREATE NONCLUSTERED INDEX IX_Assignments_UserId ON dbo.TrainingAssignments(UserId) INCLUDE (ModuleId, IsRequired, DueDate, IsActive)
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Assignments_ModuleId' AND object_id = OBJECT_ID(N'dbo.TrainingAssignments'))
    CREATE NONCLUSTERED INDEX IX_Assignments_ModuleId ON dbo.TrainingAssignments(ModuleId) INCLUDE (UserId)
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Progress_UserId' AND object_id = OBJECT_ID(N'dbo.TrainingProgress'))
    CREATE NONCLUSTERED INDEX IX_Progress_UserId ON dbo.TrainingProgress(UserId) INCLUDE (ModuleId, [Status], CompletedAt)
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Progress_Status' AND object_id = OBJECT_ID(N'dbo.TrainingProgress'))
    CREATE NONCLUSTERED INDEX IX_Progress_Status ON dbo.TrainingProgress([Status]) INCLUDE (UserId, ModuleId, CompletedAt)
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AuditLog_UserId' AND object_id = OBJECT_ID(N'dbo.AuditLog'))
    CREATE NONCLUSTERED INDEX IX_AuditLog_UserId ON dbo.AuditLog(UserId, CreatedAt DESC)
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AuditLog_CreatedAt' AND object_id = OBJECT_ID(N'dbo.AuditLog'))
    CREATE NONCLUSTERED INDEX IX_AuditLog_CreatedAt ON dbo.AuditLog(CreatedAt DESC)
GO

PRINT 'Indexes created.'
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- ── sp_ProcessRecurringTrainings ────────────────────────────────────────────
-- Called by SQL Agent job or background service. For each completed training 
-- with a recurring config, if CompletedAt + interval <= NOW, reset progress.
-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_ProcessRecurringTrainings', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_ProcessRecurringTrainings
GO

CREATE PROCEDURE dbo.sp_ProcessRecurringTrainings
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME2(7) = SYSUTCDATETIME()
    DECLARE @ProcessedCount INT = 0

    -- Find all completed trainings where recurrence interval has elapsed
    DECLARE @RecurringItems TABLE (
        ProgressId INT,
        UserId INT,
        ModuleId INT,
        AssignmentId INT,
        RecurrenceIntervalDays INT
    )

    INSERT INTO @RecurringItems (ProgressId, UserId, ModuleId, AssignmentId, RecurrenceIntervalDays)
    SELECT 
        tp.ProgressId,
        tp.UserId,
        tp.ModuleId,
        ta.AssignmentId,
        rc.RecurrenceIntervalDays
    FROM dbo.TrainingProgress tp
    INNER JOIN dbo.RecurringTrainingConfig rc ON rc.ModuleId = tp.ModuleId AND rc.IsActive = 1
    INNER JOIN dbo.TrainingAssignments ta ON ta.UserId = tp.UserId AND ta.ModuleId = tp.ModuleId AND ta.IsActive = 1
    WHERE tp.[Status] = 'Completed'
      AND tp.CompletedAt IS NOT NULL
      AND DATEADD(DAY, rc.RecurrenceIntervalDays, tp.CompletedAt) <= @Now

    -- Reset progress for each qualifying record
    UPDATE tp
    SET 
        tp.[Status] = 'NotStarted',
        tp.ResumeTimeSeconds = 0,
        tp.MaxWatchedSeconds = 0,
        tp.VideoWatchedPercent = 0.00,
        tp.CompletedAt = NULL,
        tp.ConsentedAt = NULL,
        tp.UpdatedAt = @Now
    FROM dbo.TrainingProgress tp
    INNER JOIN @RecurringItems ri ON ri.ProgressId = tp.ProgressId

    SET @ProcessedCount = @@ROWCOUNT

    -- Update due dates on assignments
    UPDATE ta
    SET 
        ta.DueDate = CAST(DATEADD(DAY, ri.RecurrenceIntervalDays, @Now) AS DATE)
    FROM dbo.TrainingAssignments ta
    INNER JOIN @RecurringItems ri ON ri.AssignmentId = ta.AssignmentId

    -- Log the processing
    IF @ProcessedCount > 0
    BEGIN
        INSERT INTO dbo.AuditLog (UserId, [Action], EntityType, Details, CreatedAt)
        VALUES (NULL, 'RecurringTrainingReset', 'System', 
                'Recurring training processor reset ' + CAST(@ProcessedCount AS NVARCHAR(10)) + ' training(s) at ' + CONVERT(NVARCHAR(30), @Now, 120),
                @Now)
    END

    SELECT @ProcessedCount AS ProcessedCount
END
GO

PRINT 'Stored procedure [sp_ProcessRecurringTrainings] created.'
GO

-- ── sp_GetEmployeeDashboard ────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetEmployeeDashboard', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetEmployeeDashboard
GO

CREATE PROCEDURE dbo.sp_GetEmployeeDashboard
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ta.AssignmentId,
        ta.ModuleId,
        tm.Title,
        tm.[Type],
        tm.[Description],
        tm.Duration,
        tm.DurationSeconds,
        tm.ContentUrl,
        tm.PosterUrl,
        ta.IsRequired,
        ta.DueDate,
        ta.IsRecurring,
        ta.RecurrenceIntervalDays,
        ISNULL(tp.[Status], 'NotStarted') AS ProgressStatus,
        ISNULL(tp.ResumeTimeSeconds, 0) AS ResumeTimeSeconds,
        ISNULL(tp.MaxWatchedSeconds, 0) AS MaxWatchedSeconds,
        ISNULL(tp.VideoWatchedPercent, 0) AS VideoWatchedPercent,
        tp.CompletedAt,
        tp.ConsentedAt
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.TrainingModules tm ON tm.ModuleId = ta.ModuleId AND tm.IsActive = 1
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.UserId = @UserId
      AND ta.IsActive = 1
    ORDER BY 
        CASE WHEN ISNULL(tp.[Status], 'NotStarted') = 'Completed' THEN 1 ELSE 0 END,
        ta.DueDate,
        tm.Title
END
GO

PRINT 'Stored procedure [sp_GetEmployeeDashboard] created.'
GO

-- ── sp_GetAdminOverview ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetAdminOverview', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetAdminOverview
GO

CREATE PROCEDURE dbo.sp_GetAdminOverview
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalEmployees INT
    DECLARE @CompliantEmployees INT
    DECLARE @PendingTrainings INT
    DECLARE @OverdueTrainings INT
    DECLARE @CompletedToday INT

    -- Total active employees
    SELECT @TotalEmployees = COUNT(*) 
    FROM dbo.Users 
    WHERE [Role] = 'Employee' AND IsActive = 1

    -- Compliant employees (all required assignments completed)
    SELECT @CompliantEmployees = COUNT(*)
    FROM (
        SELECT u.UserId
        FROM dbo.Users u
        WHERE u.[Role] = 'Employee' AND u.IsActive = 1
          AND NOT EXISTS (
              SELECT 1 
              FROM dbo.TrainingAssignments ta
              LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
              WHERE ta.UserId = u.UserId 
                AND ta.IsActive = 1 
                AND ta.IsRequired = 1
                AND (tp.[Status] IS NULL OR tp.[Status] != 'Completed')
          )
    ) AS compliant

    -- Pending required trainings
    SELECT @PendingTrainings = COUNT(*)
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.Users u ON u.UserId = ta.UserId AND u.IsActive = 1 AND u.[Role] = 'Employee'
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.IsActive = 1 
      AND ta.IsRequired = 1
      AND (tp.[Status] IS NULL OR tp.[Status] != 'Completed')

    -- Overdue trainings (due date passed, not completed)
    SELECT @OverdueTrainings = COUNT(*)
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.Users u ON u.UserId = ta.UserId AND u.IsActive = 1 AND u.[Role] = 'Employee'
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.IsActive = 1 
      AND ta.DueDate < CAST(SYSUTCDATETIME() AS DATE)
      AND (tp.[Status] IS NULL OR tp.[Status] != 'Completed')

    -- Completed today
    SELECT @CompletedToday = COUNT(*)
    FROM dbo.TrainingProgress tp
    WHERE tp.[Status] = 'Completed'
      AND CAST(tp.CompletedAt AS DATE) = CAST(SYSUTCDATETIME() AS DATE)

    SELECT 
        @TotalEmployees AS TotalEmployees,
        @CompliantEmployees AS CompliantEmployees,
        CASE WHEN @TotalEmployees > 0 
             THEN (@CompliantEmployees * 100) / @TotalEmployees 
             ELSE 0 END AS ComplianceRate,
        @PendingTrainings AS PendingTrainings,
        @OverdueTrainings AS OverdueTrainings,
        @CompletedToday AS CompletedToday
END
GO

PRINT 'Stored procedure [sp_GetAdminOverview] created.'
GO

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ── Seed Users ─────────────────────────────────────────────────────────────
-- Password for all users: Training@123
-- BCrypt hash of 'Training@123' (cost factor 11)
DECLARE @PasswordHash NVARCHAR(500) = '$2a$11$rZLk5V5j5z5z5z5z5z5z5O5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z'

-- Only insert if no users exist
IF NOT EXISTS (SELECT 1 FROM dbo.Users)
BEGIN
    INSERT INTO dbo.Users (EmployeeCode, FullName, Email, PasswordHash, Department, [Role], Initials)
    VALUES 
        ('EMP001', 'Priya Sharma',  'priya.sharma@company.com',  @PasswordHash, 'Engineering',      'Employee', 'PS'),
        ('EMP002', 'Rahul Mehta',   'rahul.mehta@company.com',   @PasswordHash, 'Marketing',        'Employee', 'RM'),
        ('EMP003', 'Ananya Desai',  'ananya.desai@company.com',  @PasswordHash, 'Human Resources',  'Employee', 'AD'),
        ('EMP004', 'Vikram Singh',  'vikram.singh@company.com',  @PasswordHash, 'Finance',          'Employee', 'VS'),
        ('EMP005', 'Sneha Patel',   'sneha.patel@company.com',   @PasswordHash, 'Engineering',      'Employee', 'SP'),
        ('ADM001', 'Arjun Kapoor',  'arjun.kapoor@company.com',  @PasswordHash, 'Operations',       'Admin',    'AK')

    PRINT 'Seed users inserted.'
END
GO

-- ── Seed Training Modules ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.TrainingModules)
BEGIN
    INSERT INTO dbo.TrainingModules (Title, [Type], [Description], Duration, DurationSeconds, ContentUrl, PosterUrl)
    VALUES 
        ('Workplace Safety Fundamentals', 'Video', 
         'Covers fire safety, emergency exits, ergonomic workstation setup, and first-aid basics.',
         '12 min', 720,
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'),

        ('Anti-Harassment Policy', 'PDF',
         'Mandatory reading on the company''s zero-tolerance harassment policy and reporting procedures.',
         '8 min read', NULL, NULL, NULL),

        ('Data Privacy & GDPR Compliance', 'Video',
         'Learn how to handle personal data, consent management, and breach notification protocols.',
         '15 min', 900,
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'),

        ('Code of Conduct', 'PDF',
         'Company-wide code of conduct covering ethics, conflicts of interest, and professional behavior.',
         '10 min read', NULL, NULL, NULL),

        ('Cybersecurity Awareness', 'Video',
         'Best practices for phishing prevention, password hygiene, and secure remote work.',
         '10 min', 600,
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg'),

        ('Diversity & Inclusion Guidelines', 'PDF',
         'Framework for building an inclusive workplace and understanding unconscious bias.',
         '6 min read', NULL, NULL, NULL),

        ('Emergency Response Training', 'Video',
         'Protocols for natural disasters, medical emergencies, and evacuation procedures.',
         '18 min', 1080,
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg'),

        ('IT Acceptable Use Policy', 'PDF',
         'Rules governing the use of company IT resources, software licensing, and network access.',
         '5 min read', NULL, NULL, NULL)

    PRINT 'Seed training modules inserted.'
END
GO

-- ── Seed Assignments ───────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.TrainingAssignments)
BEGIN
    DECLARE @AdminId INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'ADM001')
    DECLARE @u1 INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP001')
    DECLARE @u2 INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP002')
    DECLARE @u3 INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP003')
    DECLARE @u4 INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP004')
    DECLARE @u5 INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP005')

    -- Priya (u1) — 6 assignments
    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u1, 1, 1, '2026-10-01', @AdminId),
        (@u1, 2, 1, '2026-10-01', @AdminId),
        (@u1, 3, 1, '2026-09-01', @AdminId),
        (@u1, 4, 1, '2026-11-15', @AdminId),
        (@u1, 7, 1, '2026-12-31', @AdminId),
        (@u1, 8, 1, '2026-10-15', @AdminId)

    -- Rahul (u2) — 5 assignments
    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u2, 1, 1, '2026-10-01', @AdminId),
        (@u2, 2, 1, '2026-10-01', @AdminId),
        (@u2, 3, 1, '2026-09-01', @AdminId),
        (@u2, 4, 1, '2026-11-15', @AdminId),
        (@u2, 5, 0, NULL, @AdminId)

    -- Ananya (u3) — 8 assignments (all)
    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u3, 1, 1, '2026-10-01', @AdminId),
        (@u3, 2, 1, '2026-10-01', @AdminId),
        (@u3, 3, 1, '2026-10-01', @AdminId),
        (@u3, 4, 1, '2026-10-01', @AdminId),
        (@u3, 5, 1, '2026-10-01', @AdminId),
        (@u3, 6, 1, '2026-10-01', @AdminId),
        (@u3, 7, 1, '2026-10-01', @AdminId),
        (@u3, 8, 1, '2026-10-01', @AdminId)

    -- Vikram (u4) — 2 assignments
    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u4, 1, 1, '2026-08-15', @AdminId),
        (@u4, 4, 1, '2026-10-01', @AdminId)

    -- Sneha (u5) — 5 assignments
    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u5, 1, 1, '2026-10-01', @AdminId),
        (@u5, 2, 1, '2026-10-01', @AdminId),
        (@u5, 3, 1, '2026-10-01', @AdminId),
        (@u5, 7, 1, '2026-10-01', @AdminId),
        (@u5, 8, 1, '2026-10-01', @AdminId)

    PRINT 'Seed assignments inserted.'
END
GO

-- ── Seed Progress ──────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.TrainingProgress)
BEGIN
    DECLARE @u1p INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP001')
    DECLARE @u2p INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP002')
    DECLARE @u3p INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP003')
    DECLARE @u4p INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP004')
    DECLARE @u5p INT = (SELECT UserId FROM dbo.Users WHERE EmployeeCode = 'EMP005')

    -- Priya (u1) — mostly done
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u1p, 1, 'Completed', '2026-08-15 10:30:00', NULL),
        (@u1p, 2, 'Completed', '2026-08-16 14:20:00', '2026-08-16 14:20:00'),
        (@u1p, 3, 'Completed', '2026-08-20 09:45:00', NULL),
        (@u1p, 4, 'Completed', '2026-08-22 11:10:00', '2026-08-22 11:10:00')
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u1p, 7, 'InProgress', 45, 45, 4.17)
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status]) VALUES
        (@u1p, 8, 'NotStarted')

    -- Rahul (u2) — halfway
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u2p, 1, 'Completed', '2026-08-18 16:00:00', NULL),
        (@u2p, 2, 'Completed', '2026-08-19 10:00:00', '2026-08-19 10:00:00')
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u2p, 3, 'InProgress', 120, 120, 13.33)
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status]) VALUES
        (@u2p, 4, 'NotStarted')

    -- Ananya (u3) — completed everything
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u3p, 1, 'Completed', '2026-08-10 09:00:00', NULL),
        (@u3p, 2, 'Completed', '2026-08-10 10:00:00', '2026-08-10 10:00:00'),
        (@u3p, 3, 'Completed', '2026-08-11 14:00:00', NULL),
        (@u3p, 4, 'Completed', '2026-08-11 15:00:00', '2026-08-11 15:00:00'),
        (@u3p, 5, 'Completed', '2026-08-12 09:30:00', NULL),
        (@u3p, 6, 'Completed', '2026-08-12 10:30:00', '2026-08-12 10:30:00'),
        (@u3p, 7, 'Completed', '2026-08-13 11:00:00', NULL),
        (@u3p, 8, 'Completed', '2026-08-13 12:00:00', '2026-08-13 12:00:00')

    -- Vikram (u4) — barely started
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u4p, 1, 'InProgress', 30, 30, 4.17)

    -- Sneha (u5) — some progress
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u5p, 1, 'Completed', '2026-08-20 08:30:00', NULL),
        (@u5p, 2, 'Completed', '2026-08-20 09:30:00', '2026-08-20 09:30:00')
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u5p, 3, 'InProgress', 60, 60, 6.67)
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt) VALUES
        (@u5p, 7, 'Completed', '2026-08-25 13:00:00'),
        (@u5p, 8, 'Completed', '2026-08-25 14:00:00')

    PRINT 'Seed progress inserted.'
END
GO

-- ============================================================================
-- SQL AGENT JOB (for recurring training processing)
-- ============================================================================
-- NOTE: SQL Agent must be running. If you don't have SQL Agent (e.g., Express edition),
-- the ASP.NET Core background service handles this automatically.
-- ============================================================================

-- Check if SQL Agent is available before creating the job
IF EXISTS (SELECT 1 FROM master.sys.databases WHERE name = 'msdb')
BEGIN
    -- Remove existing job if present
    IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = N'LDPortal_RecurringTrainingProcessor')
    BEGIN
        EXEC msdb.dbo.sp_delete_job @job_name = N'LDPortal_RecurringTrainingProcessor', @delete_unused_schedule = 1
        PRINT 'Existing SQL Agent job removed.'
    END

    -- Create the job
    DECLARE @jobId UNIQUEIDENTIFIER
    EXEC msdb.dbo.sp_add_job 
        @job_name = N'LDPortal_RecurringTrainingProcessor',
        @enabled = 1,
        @description = N'Processes recurring training assignments. Resets completed trainings that have exceeded their recurrence interval.',
        @category_name = N'[Uncategorized (Local)]',
        @job_id = @jobId OUTPUT

    -- Add job step
    EXEC msdb.dbo.sp_add_jobstep
        @job_id = @jobId,
        @step_name = N'Execute sp_ProcessRecurringTrainings',
        @step_id = 1,
        @subsystem = N'TSQL',
        @command = N'EXEC dbo.sp_ProcessRecurringTrainings',
        @database_name = N'LDTrainingPortal',
        @retry_attempts = 3,
        @retry_interval = 5

    -- Add schedule (daily at 2:00 AM)
    EXEC msdb.dbo.sp_add_jobschedule
        @job_id = @jobId,
        @name = N'Daily_2AM',
        @freq_type = 4,          -- Daily
        @freq_interval = 1,      -- Every 1 day
        @active_start_time = 20000  -- 2:00:00 AM

    -- Set job server
    EXEC msdb.dbo.sp_add_jobserver 
        @job_id = @jobId,
        @server_name = N'(local)'

    PRINT 'SQL Agent job [LDPortal_RecurringTrainingProcessor] created — runs daily at 2:00 AM.'
END
ELSE
BEGIN
    PRINT 'WARNING: msdb not accessible. SQL Agent job not created. The ASP.NET Core background service will handle recurring trainings.'
END
GO

-- ============================================================================
-- VERIFICATION
-- ============================================================================
PRINT ''
PRINT '============================================'
PRINT ' DEPLOYMENT COMPLETE'
PRINT '============================================'
PRINT ''

SELECT 'Users' AS [Table], COUNT(*) AS [Rows] FROM dbo.Users
UNION ALL
SELECT 'TrainingModules', COUNT(*) FROM dbo.TrainingModules
UNION ALL
SELECT 'TrainingAssignments', COUNT(*) FROM dbo.TrainingAssignments
UNION ALL
SELECT 'TrainingProgress', COUNT(*) FROM dbo.TrainingProgress
UNION ALL
SELECT 'RecurringTrainingConfig', COUNT(*) FROM dbo.RecurringTrainingConfig
UNION ALL
SELECT 'AuditLog', COUNT(*) FROM dbo.AuditLog
ORDER BY [Table]

PRINT ''
PRINT 'Default login credentials:'
PRINT '  Admin:    arjun.kapoor@company.com / Training@123'
PRINT '  Employee: priya.sharma@company.com / Training@123'
PRINT '  (All users share the same default password)'
PRINT ''
PRINT 'IMPORTANT: Change passwords after first login!'
GO
