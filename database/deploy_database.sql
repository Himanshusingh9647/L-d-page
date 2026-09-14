-- ============================================================================
-- L&D TRAINING PORTAL — DATABASE DEPLOYMENT SCRIPT
-- Target: Microsoft SQL Server 2014+ (Compatibility Level 120)
-- Version: 2.0.0
-- Date: 2026-09-14
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

-- ── 3. Training Module Items (Playlist) ────────────────────────────────────
IF OBJECT_ID(N'dbo.TrainingModuleItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TrainingModuleItems (
        ItemId          INT IDENTITY(1,1) PRIMARY KEY,
        ModuleId        INT NOT NULL,
        Title           NVARCHAR(300) NOT NULL,
        ContentUrl      NVARCHAR(1000) NOT NULL,
        OrderIndex      INT NOT NULL DEFAULT 0,
        DurationSeconds INT NULL,

        CONSTRAINT FK_ModuleItems_Module FOREIGN KEY (ModuleId) REFERENCES dbo.TrainingModules(ModuleId) ON DELETE CASCADE
    )
    PRINT 'Table [dbo.TrainingModuleItems] created.'
END
GO

-- ── 4. Training Assignments ────────────────────────────────────────────────
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

-- ── 5. Training Progress ───────────────────────────────────────────────────
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

-- ── 6. Training Item Progress ──────────────────────────────────────────────
IF OBJECT_ID(N'dbo.TrainingItemProgress', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TrainingItemProgress (
        ItemProgressId  INT IDENTITY(1,1) PRIMARY KEY,
        ProgressId      INT NOT NULL,
        ItemId          INT NOT NULL,
        ResumeTimeSeconds INT NOT NULL DEFAULT 0,
        MaxWatchedSeconds INT NOT NULL DEFAULT 0,
        IsCompleted     BIT NOT NULL DEFAULT 0,

        CONSTRAINT FK_ItemProgress_Progress FOREIGN KEY (ProgressId) REFERENCES dbo.TrainingProgress(ProgressId) ON DELETE CASCADE,
        CONSTRAINT FK_ItemProgress_Item FOREIGN KEY (ItemId) REFERENCES dbo.TrainingModuleItems(ItemId)
    )
    PRINT 'Table [dbo.TrainingItemProgress] created.'
END
GO

-- ── 7. Recurring Training Config ───────────────────────────────────────────
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

-- ── 8. Audit Log ───────────────────────────────────────────────────────────
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

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ModuleItems_ModuleId' AND object_id = OBJECT_ID(N'dbo.TrainingModuleItems'))
    CREATE NONCLUSTERED INDEX IX_ModuleItems_ModuleId ON dbo.TrainingModuleItems(ModuleId) INCLUDE (Title, ContentUrl, OrderIndex)
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ItemProgress_ProgressId' AND object_id = OBJECT_ID(N'dbo.TrainingItemProgress'))
    CREATE UNIQUE NONCLUSTERED INDEX IX_ItemProgress_ProgressId ON dbo.TrainingItemProgress(ProgressId, ItemId)
GO

PRINT 'Indexes created.'
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- AUTH PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- ── sp_AuthenticateUser ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_AuthenticateUser', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_AuthenticateUser
GO
CREATE PROCEDURE dbo.sp_AuthenticateUser
    @Email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, EmployeeCode, FullName, Email, PasswordHash, Department, [Role], Initials, IsActive
    FROM dbo.Users
    WHERE Email = @Email AND IsActive = 1
END
GO

-- ── sp_GetUserById ─────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetUserById', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetUserById
GO
CREATE PROCEDURE dbo.sp_GetUserById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, EmployeeCode, FullName, Email, Department, [Role], Initials, IsActive
    FROM dbo.Users
    WHERE UserId = @UserId AND IsActive = 1
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- MODULE PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- ── sp_GetAllModules ───────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetAllModules', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAllModules
GO
CREATE PROCEDURE dbo.sp_GetAllModules
AS
BEGIN
    SET NOCOUNT ON;

    -- Return modules
    SELECT ModuleId, Title, [Type], [Description], Duration, DurationSeconds,
           ContentUrl, PosterUrl, PolicyContent, IsActive
    FROM dbo.TrainingModules
    WHERE IsActive = 1
    ORDER BY Title

    -- Return items for all active modules
    SELECT i.ItemId, i.ModuleId, i.Title, i.ContentUrl, i.OrderIndex, i.DurationSeconds
    FROM dbo.TrainingModuleItems i
    INNER JOIN dbo.TrainingModules m ON m.ModuleId = i.ModuleId
    WHERE m.IsActive = 1
    ORDER BY i.ModuleId, i.OrderIndex
END
GO

-- ── sp_GetModuleById ───────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetModuleById', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetModuleById
GO
CREATE PROCEDURE dbo.sp_GetModuleById
    @ModuleId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ModuleId, Title, [Type], [Description], Duration, DurationSeconds,
           ContentUrl, PosterUrl, PolicyContent, IsActive
    FROM dbo.TrainingModules
    WHERE ModuleId = @ModuleId AND IsActive = 1

    SELECT ItemId, ModuleId, Title, ContentUrl, OrderIndex, DurationSeconds
    FROM dbo.TrainingModuleItems
    WHERE ModuleId = @ModuleId
    ORDER BY OrderIndex
END
GO

-- ── sp_CreateModule ────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_CreateModule', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateModule
GO
CREATE PROCEDURE dbo.sp_CreateModule
    @Title          NVARCHAR(300),
    @Type           NVARCHAR(20),
    @Description    NVARCHAR(MAX) = NULL,
    @Duration       NVARCHAR(50) = NULL,
    @DurationSeconds INT = NULL,
    @ContentUrl     NVARCHAR(1000) = NULL,
    @PosterUrl      NVARCHAR(1000) = NULL,
    @PolicyContent  NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TrainingModules (Title, [Type], [Description], Duration, DurationSeconds, ContentUrl, PosterUrl, PolicyContent)
    VALUES (@Title, @Type, @Description, @Duration, @DurationSeconds, @ContentUrl, @PosterUrl, @PolicyContent)

    SELECT SCOPE_IDENTITY() AS ModuleId
END
GO

-- ── sp_UpdateModule ────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_UpdateModule', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateModule
GO
CREATE PROCEDURE dbo.sp_UpdateModule
    @ModuleId       INT,
    @Title          NVARCHAR(300),
    @Description    NVARCHAR(MAX) = NULL,
    @Duration       NVARCHAR(50) = NULL,
    @DurationSeconds INT = NULL,
    @ContentUrl     NVARCHAR(1000) = NULL,
    @PosterUrl      NVARCHAR(1000) = NULL,
    @PolicyContent  NVARCHAR(MAX) = NULL,
    @IsActive       BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.TrainingModules
    SET Title = @Title,
        [Description] = @Description,
        Duration = @Duration,
        DurationSeconds = @DurationSeconds,
        ContentUrl = @ContentUrl,
        PosterUrl = @PosterUrl,
        PolicyContent = @PolicyContent,
        IsActive = @IsActive,
        UpdatedAt = SYSUTCDATETIME()
    WHERE ModuleId = @ModuleId

    SELECT @@ROWCOUNT AS RowsAffected
END
GO

-- ── sp_CreateModuleItem ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_CreateModuleItem', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateModuleItem
GO
CREATE PROCEDURE dbo.sp_CreateModuleItem
    @ModuleId       INT,
    @Title          NVARCHAR(300),
    @ContentUrl     NVARCHAR(1000),
    @OrderIndex     INT = 0,
    @DurationSeconds INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TrainingModuleItems (ModuleId, Title, ContentUrl, OrderIndex, DurationSeconds)
    VALUES (@ModuleId, @Title, @ContentUrl, @OrderIndex, @DurationSeconds)

    SELECT SCOPE_IDENTITY() AS ItemId
END
GO

-- ── sp_DeleteModuleItems ───────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_DeleteModuleItems', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteModuleItems
GO
CREATE PROCEDURE dbo.sp_DeleteModuleItems
    @ModuleId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.TrainingModuleItems WHERE ModuleId = @ModuleId
    SELECT @@ROWCOUNT AS DeletedCount
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- ASSIGNMENT PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- ── sp_GetMyAssignments ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetMyAssignments', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetMyAssignments
GO
CREATE PROCEDURE dbo.sp_GetMyAssignments
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Result set 1: assignments with progress
    SELECT
        ta.AssignmentId,
        ta.ModuleId,
        tm.Title AS ModuleTitle,
        tm.[Type] AS ModuleType,
        tm.[Description] AS ModuleDescription,
        tm.Duration,
        tm.DurationSeconds,
        tm.ContentUrl,
        tm.PosterUrl,
        tm.PolicyContent,
        ta.IsRequired,
        ta.DueDate,
        ta.IsRecurring,
        ta.RecurrenceIntervalDays,
        ISNULL(tp.[Status], 'NotStarted') AS [Status],
        ISNULL(tp.ResumeTimeSeconds, 0) AS ResumeTimeSeconds,
        ISNULL(tp.MaxWatchedSeconds, 0) AS MaxWatchedSeconds,
        ISNULL(tp.VideoWatchedPercent, 0) AS VideoWatchedPercent,
        tp.CompletedAt,
        tp.ConsentedAt,
        tp.ProgressId
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.TrainingModules tm ON tm.ModuleId = ta.ModuleId AND tm.IsActive = 1
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.UserId = @UserId AND ta.IsActive = 1
    ORDER BY
        CASE WHEN ISNULL(tp.[Status], 'NotStarted') = 'Completed' THEN 1 ELSE 0 END,
        ta.DueDate, tm.Title

    -- Result set 2: module items for all assigned modules
    SELECT i.ItemId, i.ModuleId, i.Title, i.ContentUrl, i.OrderIndex, i.DurationSeconds
    FROM dbo.TrainingModuleItems i
    INNER JOIN dbo.TrainingAssignments ta ON ta.ModuleId = i.ModuleId
    WHERE ta.UserId = @UserId AND ta.IsActive = 1
    ORDER BY i.ModuleId, i.OrderIndex

    -- Result set 3: item progress for all assigned modules
    SELECT tip.ItemProgressId, tip.ProgressId, tip.ItemId, tip.ResumeTimeSeconds, tip.MaxWatchedSeconds, tip.IsCompleted
    FROM dbo.TrainingItemProgress tip
    INNER JOIN dbo.TrainingProgress tp ON tp.ProgressId = tip.ProgressId
    WHERE tp.UserId = @UserId
END
GO

-- ── sp_GetAssignmentMatrix ─────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetAssignmentMatrix', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAssignmentMatrix
GO
CREATE PROCEDURE dbo.sp_GetAssignmentMatrix
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: employees
    SELECT UserId, EmployeeCode, FullName, Email, Department, [Role], Initials
    FROM dbo.Users
    WHERE [Role] = 'Employee' AND IsActive = 1
    ORDER BY FullName

    -- Result 2: modules
    SELECT ModuleId, Title, [Type], [Description], Duration, IsActive
    FROM dbo.TrainingModules
    WHERE IsActive = 1
    ORDER BY Title

    -- Result 3: assignments with status
    SELECT
        ta.UserId,
        ta.ModuleId,
        CAST(1 AS BIT) AS IsAssigned,
        ta.IsRequired,
        ta.DueDate,
        ISNULL(tp.[Status], 'NotStarted') AS [Status]
    FROM dbo.TrainingAssignments ta
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.IsActive = 1
END
GO

-- ── sp_CreateAssignment ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_CreateAssignment', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateAssignment
GO
CREATE PROCEDURE dbo.sp_CreateAssignment
    @UserId     INT,
    @ModuleId   INT,
    @IsRequired BIT = 1,
    @DueDate    DATE = NULL,
    @AssignedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if user & module exist
    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @UserId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Created, 0 AS Skipped, 'User not found' AS Message
        RETURN
    END
    IF NOT EXISTS (SELECT 1 FROM dbo.TrainingModules WHERE ModuleId = @ModuleId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Created, 0 AS Skipped, 'Module not found' AS Message
        RETURN
    END

    -- Check if assignment exists
    DECLARE @ExistingId INT, @ExistingActive BIT
    SELECT @ExistingId = AssignmentId, @ExistingActive = IsActive
    FROM dbo.TrainingAssignments
    WHERE UserId = @UserId AND ModuleId = @ModuleId

    IF @ExistingId IS NOT NULL
    BEGIN
        IF @ExistingActive = 0
        BEGIN
            -- Re-activate
            UPDATE dbo.TrainingAssignments
            SET IsActive = 1, IsRequired = @IsRequired, DueDate = @DueDate,
                AssignedBy = @AssignedBy, AssignedAt = SYSUTCDATETIME()
            WHERE AssignmentId = @ExistingId

            SELECT 1 AS Created, 0 AS Skipped, 'Re-activated' AS Message
        END
        ELSE
        BEGIN
            SELECT 0 AS Created, 1 AS Skipped, 'Already assigned' AS Message
        END
        RETURN
    END

    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy)
    VALUES (@UserId, @ModuleId, @IsRequired, @DueDate, @AssignedBy)

    SELECT 1 AS Created, 0 AS Skipped, 'Assigned' AS Message
END
GO

-- ── sp_RemoveAssignment ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_RemoveAssignment', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_RemoveAssignment
GO
CREATE PROCEDURE dbo.sp_RemoveAssignment
    @UserId   INT,
    @ModuleId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.TrainingAssignments
    SET IsActive = 0
    WHERE UserId = @UserId AND ModuleId = @ModuleId AND IsActive = 1

    SELECT @@ROWCOUNT AS Removed
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- PROGRESS PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- ── sp_UpsertVideoProgress ─────────────────────────────────────────────────
-- Saves resume time & max watched for a specific playlist item.
-- Creates the TrainingProgress row if it doesn't exist.
-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_UpsertVideoProgress', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpsertVideoProgress
GO
CREATE PROCEDURE dbo.sp_UpsertVideoProgress
    @UserId             INT,
    @ModuleId           INT,
    @ItemId             INT,
    @ResumeTimeSeconds  INT,
    @MaxWatchedSeconds  INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify assignment
    IF NOT EXISTS (SELECT 1 FROM dbo.TrainingAssignments WHERE UserId = @UserId AND ModuleId = @ModuleId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Success, 'Not assigned to this module' AS Message
        RETURN
    END

    DECLARE @ProgressId INT, @CurrentStatus NVARCHAR(20)
    DECLARE @Now DATETIME2(7) = SYSUTCDATETIME()

    -- Get or create progress
    SELECT @ProgressId = ProgressId, @CurrentStatus = [Status]
    FROM dbo.TrainingProgress
    WHERE UserId = @UserId AND ModuleId = @ModuleId

    IF @ProgressId IS NULL
    BEGIN
        INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent, CreatedAt)
        VALUES (@UserId, @ModuleId, 'InProgress', 0, 0, 0, @Now)

        SET @ProgressId = SCOPE_IDENTITY()
        SET @CurrentStatus = 'InProgress'
    END

    -- Don't update if already completed
    IF @CurrentStatus = 'Completed'
    BEGIN
        SELECT 1 AS Success, 'Already completed' AS Message
        RETURN
    END

    -- Update status to InProgress
    UPDATE dbo.TrainingProgress
    SET [Status] = 'InProgress', UpdatedAt = @Now
    WHERE ProgressId = @ProgressId AND [Status] = 'NotStarted'

    -- Upsert item progress
    DECLARE @ItemProgressId INT
    SELECT @ItemProgressId = ItemProgressId FROM dbo.TrainingItemProgress WHERE ProgressId = @ProgressId AND ItemId = @ItemId

    IF @ItemProgressId IS NULL
    BEGIN
        INSERT INTO dbo.TrainingItemProgress (ProgressId, ItemId, ResumeTimeSeconds, MaxWatchedSeconds, IsCompleted)
        VALUES (@ProgressId, @ItemId, @ResumeTimeSeconds, @MaxWatchedSeconds, 0)
    END
    ELSE
    BEGIN
        -- Only update if not already completed
        UPDATE dbo.TrainingItemProgress
        SET ResumeTimeSeconds = @ResumeTimeSeconds,
            MaxWatchedSeconds = CASE WHEN @MaxWatchedSeconds > MaxWatchedSeconds THEN @MaxWatchedSeconds ELSE MaxWatchedSeconds END
        WHERE ItemProgressId = @ItemProgressId AND IsCompleted = 0
    END

    SELECT 1 AS Success, 'Progress saved' AS Message
END
GO

-- ── sp_CompleteVideoItem ───────────────────────────────────────────────────
-- Marks a single playlist item as completed.
-- Then checks if all items in the module are completed → auto-complete the module.
-- Returns whether the entire module is now complete.
-- ────────────────────────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_CompleteVideoItem', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CompleteVideoItem
GO
CREATE PROCEDURE dbo.sp_CompleteVideoItem
    @UserId   INT,
    @ModuleId INT,
    @ItemId   INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify assignment
    IF NOT EXISTS (SELECT 1 FROM dbo.TrainingAssignments WHERE UserId = @UserId AND ModuleId = @ModuleId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Success, 'Not assigned' AS Message, 0 AS ModuleCompleted
        RETURN
    END

    -- Verify module is Video
    IF NOT EXISTS (SELECT 1 FROM dbo.TrainingModules WHERE ModuleId = @ModuleId AND [Type] = 'Video')
    BEGIN
        SELECT 0 AS Success, 'Not a video module' AS Message, 0 AS ModuleCompleted
        RETURN
    END

    DECLARE @ProgressId INT, @Now DATETIME2(7) = SYSUTCDATETIME()

    -- Get or create progress
    SELECT @ProgressId = ProgressId FROM dbo.TrainingProgress WHERE UserId = @UserId AND ModuleId = @ModuleId

    IF @ProgressId IS NULL
    BEGIN
        INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CreatedAt)
        VALUES (@UserId, @ModuleId, 'InProgress', @Now)
        SET @ProgressId = SCOPE_IDENTITY()
    END

    -- Upsert item progress as completed
    IF EXISTS (SELECT 1 FROM dbo.TrainingItemProgress WHERE ProgressId = @ProgressId AND ItemId = @ItemId)
    BEGIN
        UPDATE dbo.TrainingItemProgress SET IsCompleted = 1 WHERE ProgressId = @ProgressId AND ItemId = @ItemId
    END
    ELSE
    BEGIN
        INSERT INTO dbo.TrainingItemProgress (ProgressId, ItemId, ResumeTimeSeconds, MaxWatchedSeconds, IsCompleted)
        VALUES (@ProgressId, @ItemId, 0, 0, 1)
    END

    -- Check if ALL items in this module are now completed
    DECLARE @TotalItems INT, @CompletedItems INT

    SELECT @TotalItems = COUNT(*) FROM dbo.TrainingModuleItems WHERE ModuleId = @ModuleId
    SELECT @CompletedItems = COUNT(*) FROM dbo.TrainingItemProgress tip
        INNER JOIN dbo.TrainingModuleItems tmi ON tmi.ItemId = tip.ItemId
        WHERE tip.ProgressId = @ProgressId AND tmi.ModuleId = @ModuleId AND tip.IsCompleted = 1

    DECLARE @ModuleCompleted BIT = 0
    IF @TotalItems > 0 AND @CompletedItems >= @TotalItems
    BEGIN
        UPDATE dbo.TrainingProgress
        SET [Status] = 'Completed', CompletedAt = @Now, VideoWatchedPercent = 100.00, UpdatedAt = @Now
        WHERE ProgressId = @ProgressId

        SET @ModuleCompleted = 1
    END

    SELECT 1 AS Success, 'Item completed' AS Message, @ModuleCompleted AS ModuleCompleted
END
GO

-- ── sp_ConsentPdf ──────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_ConsentPdf', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_ConsentPdf
GO
CREATE PROCEDURE dbo.sp_ConsentPdf
    @UserId   INT,
    @ModuleId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify assignment
    IF NOT EXISTS (SELECT 1 FROM dbo.TrainingAssignments WHERE UserId = @UserId AND ModuleId = @ModuleId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Success, 'Not assigned' AS Message
        RETURN
    END

    -- Verify module is PDF
    DECLARE @ModuleTitle NVARCHAR(300)
    SELECT @ModuleTitle = Title FROM dbo.TrainingModules WHERE ModuleId = @ModuleId AND [Type] = 'PDF'
    IF @ModuleTitle IS NULL
    BEGIN
        SELECT 0 AS Success, 'Not a PDF module' AS Message
        RETURN
    END

    DECLARE @Now DATETIME2(7) = SYSUTCDATETIME()

    -- Upsert progress
    IF EXISTS (SELECT 1 FROM dbo.TrainingProgress WHERE UserId = @UserId AND ModuleId = @ModuleId)
    BEGIN
        UPDATE dbo.TrainingProgress
        SET [Status] = 'Completed', ConsentedAt = @Now, CompletedAt = @Now, UpdatedAt = @Now
        WHERE UserId = @UserId AND ModuleId = @ModuleId
    END
    ELSE
    BEGIN
        INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ConsentedAt, CompletedAt, CreatedAt)
        VALUES (@UserId, @ModuleId, 'Completed', @Now, @Now, @Now)
    END

    SELECT 1 AS Success, 'Consent recorded for ''' + @ModuleTitle + '''' AS Message
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- ADMIN PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- ── sp_GetAdminOverview ────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetAdminOverview', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAdminOverview
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

    SELECT @TotalEmployees = COUNT(*)
    FROM dbo.Users
    WHERE [Role] = 'Employee' AND IsActive = 1

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
          AND EXISTS (
              SELECT 1 FROM dbo.TrainingAssignments ta2
              WHERE ta2.UserId = u.UserId AND ta2.IsActive = 1 AND ta2.IsRequired = 1
          )
    ) AS compliant

    SELECT @PendingTrainings = COUNT(*)
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.Users u ON u.UserId = ta.UserId AND u.IsActive = 1 AND u.[Role] = 'Employee'
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.IsActive = 1
      AND ta.IsRequired = 1
      AND (tp.[Status] IS NULL OR tp.[Status] != 'Completed')

    SELECT @OverdueTrainings = COUNT(*)
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.Users u ON u.UserId = ta.UserId AND u.IsActive = 1 AND u.[Role] = 'Employee'
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.IsActive = 1
      AND ta.DueDate < CAST(SYSUTCDATETIME() AS DATE)
      AND (tp.[Status] IS NULL OR tp.[Status] != 'Completed')

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

-- ── sp_GetEmployees ────────────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetEmployees', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetEmployees
GO
CREATE PROCEDURE dbo.sp_GetEmployees
    @Search NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UserId, u.EmployeeCode, u.FullName, u.Department, u.Initials,
        COUNT(ta.AssignmentId) AS TotalAssigned,
        SUM(CASE WHEN ISNULL(tp.[Status], 'NotStarted') = 'Completed' THEN 1 ELSE 0 END) AS Completed,
        SUM(CASE WHEN ISNULL(tp.[Status], 'NotStarted') != 'Completed' THEN 1 ELSE 0 END) AS Pending,
        SUM(CASE WHEN ISNULL(tp.[Status], 'NotStarted') != 'Completed' AND ta.DueDate < CAST(SYSUTCDATETIME() AS DATE) THEN 1 ELSE 0 END) AS Overdue,
        SUM(CASE WHEN tm.[Type] = 'Video' AND ISNULL(tp.[Status], 'NotStarted') = 'Completed' THEN 1 ELSE 0 END) AS VideosCompleted,
        SUM(CASE WHEN tm.[Type] = 'Video' THEN 1 ELSE 0 END) AS TotalVideos,
        SUM(CASE WHEN tm.[Type] = 'PDF' AND ISNULL(tp.[Status], 'NotStarted') = 'Completed' THEN 1 ELSE 0 END) AS PdfsCompleted,
        SUM(CASE WHEN tm.[Type] = 'PDF' THEN 1 ELSE 0 END) AS TotalPdfs,
        CASE WHEN COUNT(CASE WHEN ta.IsRequired = 1 THEN 1 END) > 0
             AND COUNT(CASE WHEN ta.IsRequired = 1 AND ISNULL(tp.[Status], 'NotStarted') != 'Completed' THEN 1 END) = 0
             THEN CAST(1 AS BIT)
             ELSE CAST(0 AS BIT)
        END AS IsCompliant
    FROM dbo.Users u
    LEFT JOIN dbo.TrainingAssignments ta ON ta.UserId = u.UserId AND ta.IsActive = 1
    LEFT JOIN dbo.TrainingModules tm ON tm.ModuleId = ta.ModuleId AND tm.IsActive = 1
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = u.UserId AND tp.ModuleId = ta.ModuleId
    WHERE u.[Role] = 'Employee' AND u.IsActive = 1
      AND (@Search IS NULL OR @Search = ''
           OR u.FullName LIKE '%' + @Search + '%'
           OR u.Department LIKE '%' + @Search + '%'
           OR u.EmployeeCode LIKE '%' + @Search + '%')
    GROUP BY u.UserId, u.EmployeeCode, u.FullName, u.Department, u.Initials
    ORDER BY u.FullName
END
GO

-- ── sp_GetEmployeeDetail ───────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetEmployeeDetail', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetEmployeeDetail
GO
CREATE PROCEDURE dbo.sp_GetEmployeeDetail
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: employee info
    SELECT UserId, EmployeeCode, FullName, Email, Department, [Role], Initials
    FROM dbo.Users
    WHERE UserId = @UserId AND IsActive = 1

    -- Result 2: trainings with progress
    SELECT
        tm.ModuleId,
        tm.Title AS ModuleTitle,
        tm.[Type] AS ModuleType,
        tm.[Description] AS ModuleDescription,
        tm.Duration,
        tm.DurationSeconds,
        tm.ContentUrl,
        tm.PosterUrl,
        ta.IsRequired,
        ta.DueDate,
        ISNULL(tp.[Status], 'NotStarted') AS [Status],
        ISNULL(tp.ResumeTimeSeconds, 0) AS ResumeTimeSeconds,
        ISNULL(tp.MaxWatchedSeconds, 0) AS MaxWatchedSeconds,
        ISNULL(tp.VideoWatchedPercent, 0) AS VideoWatchedPercent,
        tp.CompletedAt,
        tp.ConsentedAt,
        ta.IsRecurring,
        ta.RecurrenceIntervalDays
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.TrainingModules tm ON tm.ModuleId = ta.ModuleId AND tm.IsActive = 1
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.UserId = @UserId AND ta.IsActive = 1
    ORDER BY
        CASE WHEN ISNULL(tp.[Status], 'NotStarted') = 'Completed' THEN 1 ELSE 0 END,
        ta.DueDate, tm.Title
END
GO

-- ── sp_GetEmployeeDashboard ────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetEmployeeDashboard', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetEmployeeDashboard
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

-- ────────────────────────────────────────────────────────────────────────────
-- RECURRING PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- ── sp_GetRecurringConfigs ─────────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_GetRecurringConfigs', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetRecurringConfigs
GO
CREATE PROCEDURE dbo.sp_GetRecurringConfigs
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rc.ConfigId, rc.ModuleId, tm.Title AS ModuleTitle, tm.[Type] AS ModuleType,
        rc.RecurrenceIntervalDays, rc.IsActive,
        u.FullName AS CreatedByName, rc.CreatedAt
    FROM dbo.RecurringTrainingConfig rc
    INNER JOIN dbo.TrainingModules tm ON tm.ModuleId = rc.ModuleId
    LEFT JOIN dbo.Users u ON u.UserId = rc.CreatedBy
    ORDER BY tm.Title
END
GO

-- ── sp_CreateRecurringConfig ───────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_CreateRecurringConfig', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateRecurringConfig
GO
CREATE PROCEDURE dbo.sp_CreateRecurringConfig
    @ModuleId               INT,
    @RecurrenceIntervalDays INT = 90,
    @CreatedBy              INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ModuleTitle NVARCHAR(300)
    SELECT @ModuleTitle = Title FROM dbo.TrainingModules WHERE ModuleId = @ModuleId AND IsActive = 1
    IF @ModuleTitle IS NULL
    BEGIN
        SELECT 0 AS Success, 'Module not found' AS Message
        RETURN
    END

    -- Upsert
    IF EXISTS (SELECT 1 FROM dbo.RecurringTrainingConfig WHERE ModuleId = @ModuleId)
    BEGIN
        UPDATE dbo.RecurringTrainingConfig
        SET RecurrenceIntervalDays = @RecurrenceIntervalDays, IsActive = 1, UpdatedAt = SYSUTCDATETIME()
        WHERE ModuleId = @ModuleId
    END
    ELSE
    BEGIN
        INSERT INTO dbo.RecurringTrainingConfig (ModuleId, RecurrenceIntervalDays, CreatedBy)
        VALUES (@ModuleId, @RecurrenceIntervalDays, @CreatedBy)
    END

    -- Update assignments
    UPDATE dbo.TrainingAssignments
    SET IsRecurring = 1, RecurrenceIntervalDays = @RecurrenceIntervalDays
    WHERE ModuleId = @ModuleId AND IsActive = 1

    SELECT 1 AS Success, 'Recurring training configured for ''' + @ModuleTitle + ''' every ' + CAST(@RecurrenceIntervalDays AS NVARCHAR(10)) + ' days.' AS Message
END
GO

-- ── sp_UpdateRecurringConfig ───────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_UpdateRecurringConfig', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateRecurringConfig
GO
CREATE PROCEDURE dbo.sp_UpdateRecurringConfig
    @ConfigId               INT,
    @RecurrenceIntervalDays INT,
    @IsActive               BIT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ModuleId INT
    SELECT @ModuleId = ModuleId FROM dbo.RecurringTrainingConfig WHERE ConfigId = @ConfigId
    IF @ModuleId IS NULL
    BEGIN
        SELECT 0 AS Success, 'Config not found' AS Message
        RETURN
    END

    UPDATE dbo.RecurringTrainingConfig
    SET RecurrenceIntervalDays = @RecurrenceIntervalDays, IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME()
    WHERE ConfigId = @ConfigId

    UPDATE dbo.TrainingAssignments
    SET IsRecurring = @IsActive,
        RecurrenceIntervalDays = CASE WHEN @IsActive = 1 THEN @RecurrenceIntervalDays ELSE NULL END
    WHERE ModuleId = @ModuleId AND IsActive = 1

    SELECT 1 AS Success, 'Configuration updated' AS Message
END
GO

-- ── sp_DeleteRecurringConfig ───────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_DeleteRecurringConfig', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteRecurringConfig
GO
CREATE PROCEDURE dbo.sp_DeleteRecurringConfig
    @ConfigId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ModuleId INT
    SELECT @ModuleId = ModuleId FROM dbo.RecurringTrainingConfig WHERE ConfigId = @ConfigId
    IF @ModuleId IS NULL
    BEGIN
        SELECT 0 AS Success, 'Config not found' AS Message
        RETURN
    END

    UPDATE dbo.RecurringTrainingConfig
    SET IsActive = 0, UpdatedAt = SYSUTCDATETIME()
    WHERE ConfigId = @ConfigId

    UPDATE dbo.TrainingAssignments
    SET IsRecurring = 0, RecurrenceIntervalDays = NULL
    WHERE ModuleId = @ModuleId AND IsActive = 1

    SELECT 1 AS Success, 'Configuration disabled' AS Message
END
GO

-- ── sp_ProcessRecurringTrainings ────────────────────────────────────────────
IF OBJECT_ID(N'dbo.sp_ProcessRecurringTrainings', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_ProcessRecurringTrainings
GO
CREATE PROCEDURE dbo.sp_ProcessRecurringTrainings
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME2(7) = SYSUTCDATETIME()
    DECLARE @ProcessedCount INT = 0

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

    -- Reset progress
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

    -- Delete item progress for reset trainings
    DELETE tip
    FROM dbo.TrainingItemProgress tip
    INNER JOIN @RecurringItems ri ON ri.ProgressId = tip.ProgressId

    -- Update due dates
    UPDATE ta
    SET ta.DueDate = CAST(DATEADD(DAY, ri.RecurrenceIntervalDays, @Now) AS DATE)
    FROM dbo.TrainingAssignments ta
    INNER JOIN @RecurringItems ri ON ri.AssignmentId = ta.AssignmentId

    -- Audit log
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

PRINT 'All stored procedures created.'
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

-- ── Seed Module Items (Playlist entries for video modules) ─────────────────
IF NOT EXISTS (SELECT 1 FROM dbo.TrainingModuleItems)
BEGIN
    -- Add single-item playlists for existing video modules
    INSERT INTO dbo.TrainingModuleItems (ModuleId, Title, ContentUrl, OrderIndex, DurationSeconds)
    SELECT ModuleId, Title, ContentUrl, 0, DurationSeconds
    FROM dbo.TrainingModules
    WHERE [Type] = 'Video' AND ContentUrl IS NOT NULL

    PRINT 'Seed module items inserted.'
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

    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u1, 1, 1, '2026-10-01', @AdminId),
        (@u1, 2, 1, '2026-10-01', @AdminId),
        (@u1, 3, 1, '2026-09-01', @AdminId),
        (@u1, 4, 1, '2026-11-15', @AdminId),
        (@u1, 7, 1, '2026-12-31', @AdminId),
        (@u1, 8, 1, '2026-10-15', @AdminId)

    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u2, 1, 1, '2026-10-01', @AdminId),
        (@u2, 2, 1, '2026-10-01', @AdminId),
        (@u2, 3, 1, '2026-09-01', @AdminId),
        (@u2, 4, 1, '2026-11-15', @AdminId),
        (@u2, 5, 0, NULL, @AdminId)

    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u3, 1, 1, '2026-10-01', @AdminId),
        (@u3, 2, 1, '2026-10-01', @AdminId),
        (@u3, 3, 1, '2026-10-01', @AdminId),
        (@u3, 4, 1, '2026-10-01', @AdminId),
        (@u3, 5, 1, '2026-10-01', @AdminId),
        (@u3, 6, 1, '2026-10-01', @AdminId),
        (@u3, 7, 1, '2026-10-01', @AdminId),
        (@u3, 8, 1, '2026-10-01', @AdminId)

    INSERT INTO dbo.TrainingAssignments (UserId, ModuleId, IsRequired, DueDate, AssignedBy) VALUES
        (@u4, 1, 1, '2026-08-15', @AdminId),
        (@u4, 4, 1, '2026-10-01', @AdminId)

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

    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u1p, 1, 'Completed', '2026-08-15 10:30:00', NULL),
        (@u1p, 2, 'Completed', '2026-08-16 14:20:00', '2026-08-16 14:20:00'),
        (@u1p, 3, 'Completed', '2026-08-20 09:45:00', NULL),
        (@u1p, 4, 'Completed', '2026-08-22 11:10:00', '2026-08-22 11:10:00')
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u1p, 7, 'InProgress', 45, 45, 4.17)
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status]) VALUES
        (@u1p, 8, 'NotStarted')

    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u2p, 1, 'Completed', '2026-08-18 16:00:00', NULL),
        (@u2p, 2, 'Completed', '2026-08-19 10:00:00', '2026-08-19 10:00:00')
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u2p, 3, 'InProgress', 120, 120, 13.33)
    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status]) VALUES
        (@u2p, 4, 'NotStarted')

    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], CompletedAt, ConsentedAt) VALUES
        (@u3p, 1, 'Completed', '2026-08-10 09:00:00', NULL),
        (@u3p, 2, 'Completed', '2026-08-10 10:00:00', '2026-08-10 10:00:00'),
        (@u3p, 3, 'Completed', '2026-08-11 14:00:00', NULL),
        (@u3p, 4, 'Completed', '2026-08-11 15:00:00', '2026-08-11 15:00:00'),
        (@u3p, 5, 'Completed', '2026-08-12 09:30:00', NULL),
        (@u3p, 6, 'Completed', '2026-08-12 10:30:00', '2026-08-12 10:30:00'),
        (@u3p, 7, 'Completed', '2026-08-13 11:00:00', NULL),
        (@u3p, 8, 'Completed', '2026-08-13 12:00:00', '2026-08-13 12:00:00')

    INSERT INTO dbo.TrainingProgress (UserId, ModuleId, [Status], ResumeTimeSeconds, MaxWatchedSeconds, VideoWatchedPercent) VALUES
        (@u4p, 1, 'InProgress', 30, 30, 4.17)

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
IF EXISTS (SELECT 1 FROM master.sys.databases WHERE name = 'msdb')
BEGIN
    IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = N'LDPortal_RecurringTrainingProcessor')
    BEGIN
        EXEC msdb.dbo.sp_delete_job @job_name = N'LDPortal_RecurringTrainingProcessor', @delete_unused_schedule = 1
        PRINT 'Existing SQL Agent job removed.'
    END

    DECLARE @jobId UNIQUEIDENTIFIER
    EXEC msdb.dbo.sp_add_job
        @job_name = N'LDPortal_RecurringTrainingProcessor',
        @enabled = 1,
        @description = N'Processes recurring training assignments. Resets completed trainings that have exceeded their recurrence interval.',
        @category_name = N'[Uncategorized (Local)]',
        @job_id = @jobId OUTPUT

    EXEC msdb.dbo.sp_add_jobstep
        @job_id = @jobId,
        @step_name = N'Execute sp_ProcessRecurringTrainings',
        @step_id = 1,
        @subsystem = N'TSQL',
        @command = N'EXEC dbo.sp_ProcessRecurringTrainings',
        @database_name = N'LDTrainingPortal',
        @retry_attempts = 3,
        @retry_interval = 5

    EXEC msdb.dbo.sp_add_jobschedule
        @job_id = @jobId,
        @name = N'Daily_2AM',
        @freq_type = 4,
        @freq_interval = 1,
        @active_start_time = 20000

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
PRINT ' DEPLOYMENT COMPLETE — v2.0.0'
PRINT '============================================'
PRINT ''

SELECT 'Users' AS [Table], COUNT(*) AS [Rows] FROM dbo.Users
UNION ALL
SELECT 'TrainingModules', COUNT(*) FROM dbo.TrainingModules
UNION ALL
SELECT 'TrainingModuleItems', COUNT(*) FROM dbo.TrainingModuleItems
UNION ALL
SELECT 'TrainingAssignments', COUNT(*) FROM dbo.TrainingAssignments
UNION ALL
SELECT 'TrainingProgress', COUNT(*) FROM dbo.TrainingProgress
UNION ALL
SELECT 'TrainingItemProgress', COUNT(*) FROM dbo.TrainingItemProgress
UNION ALL
SELECT 'RecurringTrainingConfig', COUNT(*) FROM dbo.RecurringTrainingConfig
UNION ALL
SELECT 'AuditLog', COUNT(*) FROM dbo.AuditLog
ORDER BY [Table]

SELECT 'Stored Procedures' AS ObjectType, COUNT(*) AS [Count]
FROM sys.procedures
WHERE schema_id = SCHEMA_ID('dbo') AND name LIKE 'sp_%'

PRINT ''
PRINT 'Default login credentials:'
PRINT '  Admin:    arjun.kapoor@company.com / Training@123'
PRINT '  Employee: priya.sharma@company.com / Training@123'
PRINT '  (All users share the same default password)'
PRINT ''
PRINT 'IMPORTANT: Change passwords after first login!'
GO
