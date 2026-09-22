USE [LDTrainingPortal]
GO

-- ============================================================================
-- 02_Samsung_HR_Enhancements.sql
-- Upgrades schema with:
--  1. Module Category (IT vs HR)
--  2. Dual-Window Recurring Training (RecurrenceIntervalDays + CompletionDays)
-- ============================================================================

-- 1. Alter TrainingModules: Add Category ('IT' or 'HR')
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.TrainingModules') AND name = 'Category'
)
BEGIN
    ALTER TABLE dbo.TrainingModules ADD Category NVARCHAR(50) NOT NULL CONSTRAINT DF_TrainingModules_Category DEFAULT 'HR';
    PRINT 'Column [Category] added to dbo.TrainingModules.'
END
GO

-- 2. Alter RecurringTrainingConfig: Add CompletionDays
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.RecurringTrainingConfig') AND name = 'CompletionDays'
)
BEGIN
    ALTER TABLE dbo.RecurringTrainingConfig ADD CompletionDays INT NOT NULL CONSTRAINT DF_Recurring_CompletionDays DEFAULT 5;
    PRINT 'Column [CompletionDays] added to dbo.RecurringTrainingConfig.'
END
GO

-- 3. Alter TrainingAssignments: Add CompletionDays
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.TrainingAssignments') AND name = 'CompletionDays'
)
BEGIN
    ALTER TABLE dbo.TrainingAssignments ADD CompletionDays INT NULL CONSTRAINT DF_Assignments_CompletionDays DEFAULT 5;
    PRINT 'Column [CompletionDays] added to dbo.TrainingAssignments.'
END
GO

-- ============================================================================
-- STORED PROCEDURES UPDATES
-- ============================================================================

-- sp_CreateModule with Category
IF OBJECT_ID(N'dbo.sp_CreateModule', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateModule
GO
CREATE PROCEDURE dbo.sp_CreateModule
    @Title           NVARCHAR(300),
    @Type            NVARCHAR(20),
    @Category        NVARCHAR(50) = 'HR',
    @Description     NVARCHAR(MAX) = NULL,
    @Duration        NVARCHAR(50) = NULL,
    @DurationSeconds INT = NULL,
    @ContentUrl      NVARCHAR(1000) = NULL,
    @PosterUrl       NVARCHAR(1000) = NULL,
    @PolicyContent   NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TrainingModules (
        Title, [Type], Category, [Description], Duration, DurationSeconds,
        ContentUrl, PosterUrl, PolicyContent
    )
    VALUES (
        @Title, @Type, ISNULL(@Category, 'HR'), @Description, @Duration, @DurationSeconds,
        @ContentUrl, @PosterUrl, @PolicyContent
    );

    SELECT SCOPE_IDENTITY() AS ModuleId;
END
GO

-- sp_UpdateModule with Category
IF OBJECT_ID(N'dbo.sp_UpdateModule', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateModule
GO
CREATE PROCEDURE dbo.sp_UpdateModule
    @ModuleId        INT,
    @Title           NVARCHAR(300),
    @Category        NVARCHAR(50) = 'HR',
    @Description     NVARCHAR(MAX) = NULL,
    @Duration        NVARCHAR(50) = NULL,
    @DurationSeconds INT = NULL,
    @ContentUrl      NVARCHAR(1000) = NULL,
    @PosterUrl       NVARCHAR(1000) = NULL,
    @PolicyContent   NVARCHAR(MAX) = NULL,
    @IsActive        BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.TrainingModules
    SET Title = @Title,
        Category = ISNULL(@Category, 'HR'),
        [Description] = @Description,
        Duration = @Duration,
        DurationSeconds = @DurationSeconds,
        ContentUrl = @ContentUrl,
        PosterUrl = @PosterUrl,
        PolicyContent = @PolicyContent,
        IsActive = @IsActive,
        UpdatedAt = SYSUTCDATETIME()
    WHERE ModuleId = @ModuleId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- sp_GetAllModules returning Category
IF OBJECT_ID(N'dbo.sp_GetAllModules', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAllModules
GO
CREATE PROCEDURE dbo.sp_GetAllModules
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: Modules
    SELECT 
        ModuleId, Title, [Type], Category, [Description], Duration, 
        DurationSeconds, ContentUrl, PosterUrl, PolicyContent, IsActive
    FROM dbo.TrainingModules
    ORDER BY ModuleId ASC;

    -- Result 2: Module Items
    SELECT 
        ItemId, ModuleId, Title, ContentUrl, OrderIndex, DurationSeconds
    FROM dbo.TrainingModuleItems
    ORDER BY ModuleId ASC, OrderIndex ASC;
END
GO

-- sp_GetModuleById returning Category
IF OBJECT_ID(N'dbo.sp_GetModuleById', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetModuleById
GO
CREATE PROCEDURE dbo.sp_GetModuleById
    @ModuleId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: Module
    SELECT 
        ModuleId, Title, [Type], Category, [Description], Duration, 
        DurationSeconds, ContentUrl, PosterUrl, PolicyContent, IsActive
    FROM dbo.TrainingModules
    WHERE ModuleId = @ModuleId;

    -- Result 2: Module Items
    SELECT 
        ItemId, ModuleId, Title, ContentUrl, OrderIndex, DurationSeconds
    FROM dbo.TrainingModuleItems
    WHERE ModuleId = @ModuleId
    ORDER BY OrderIndex ASC;
END
GO

-- sp_CreateAssignment with Recurring & CompletionDays
IF OBJECT_ID(N'dbo.sp_CreateAssignment', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateAssignment
GO
CREATE PROCEDURE dbo.sp_CreateAssignment
    @UserId                 INT,
    @ModuleId               INT,
    @IsRequired             BIT = 1,
    @DueDate                DATE = NULL,
    @AssignedBy             INT = NULL,
    @IsRecurring            BIT = 0,
    @RecurrenceIntervalDays INT = NULL,
    @CompletionDays         INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @UserId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Created, 0 AS Skipped, 'User not found' AS Message;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.TrainingModules WHERE ModuleId = @ModuleId AND IsActive = 1)
    BEGIN
        SELECT 0 AS Created, 0 AS Skipped, 'Module not found' AS Message;
        RETURN;
    END

    DECLARE @ExistingId INT, @ExistingActive BIT;
    SELECT @ExistingId = AssignmentId, @ExistingActive = IsActive
    FROM dbo.TrainingAssignments
    WHERE UserId = @UserId AND ModuleId = @ModuleId;

    DECLARE @ModuleTitle NVARCHAR(300);
    SELECT @ModuleTitle = Title FROM dbo.TrainingModules WHERE ModuleId = @ModuleId;

    -- Default Due Date if not specified but completion days is given
    IF @DueDate IS NULL AND @CompletionDays IS NOT NULL AND @CompletionDays > 0
    BEGIN
        SET @DueDate = DATEADD(day, @CompletionDays, CAST(SYSUTCDATETIME() AS DATE));
    END

    IF @ExistingId IS NOT NULL
    BEGIN
        IF @ExistingActive = 0
        BEGIN
            UPDATE dbo.TrainingAssignments
            SET IsActive = 1, 
                IsRequired = @IsRequired, 
                DueDate = @DueDate,
                AssignedBy = @AssignedBy, 
                AssignedAt = SYSUTCDATETIME(),
                IsRecurring = @IsRecurring,
                RecurrenceIntervalDays = @RecurrenceIntervalDays,
                CompletionDays = @CompletionDays
            WHERE AssignmentId = @ExistingId;

            -- Notification
            INSERT INTO dbo.Notifications (UserId, Title, Message, [Type])
            VALUES (@UserId, 'Training Re-assigned', 'You have been re-assigned to training: ' + @ModuleTitle, 'Assignment');

            SELECT 1 AS Created, 0 AS Skipped, 'Re-activated' AS Message;
        END
        ELSE
        BEGIN
            UPDATE dbo.TrainingAssignments
            SET IsRecurring = @IsRecurring,
                RecurrenceIntervalDays = @RecurrenceIntervalDays,
                CompletionDays = @CompletionDays
            WHERE AssignmentId = @ExistingId;

            SELECT 0 AS Created, 1 AS Skipped, 'Already assigned (updated recurring settings)' AS Message;
        END
        RETURN;
    END

    INSERT INTO dbo.TrainingAssignments (
        UserId, ModuleId, IsRequired, DueDate, AssignedBy, IsRecurring, RecurrenceIntervalDays, CompletionDays
    )
    VALUES (
        @UserId, @ModuleId, @IsRequired, @DueDate, @AssignedBy, @IsRecurring, @RecurrenceIntervalDays, @CompletionDays
    );

    -- Generate Notification
    DECLARE @Msg NVARCHAR(500) = 'You have been assigned a new training module: ' + @ModuleTitle;
    IF @DueDate IS NOT NULL
    BEGIN
        SET @Msg = @Msg + '. Due by ' + CONVERT(VARCHAR, @DueDate, 107);
    END

    INSERT INTO dbo.Notifications (UserId, Title, Message, [Type])
    VALUES (@UserId, 'New Training Assigned', @Msg, 'Assignment');

    SELECT 1 AS Created, 0 AS Skipped, 'Assigned' AS Message;
END
GO

-- sp_GetMyAssignments returning Category and CompletionDays
IF OBJECT_ID(N'dbo.sp_GetMyAssignments', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetMyAssignments
GO
CREATE PROCEDURE dbo.sp_GetMyAssignments
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: Assignments with Progress
    SELECT 
        m.ModuleId,
        m.Title AS ModuleTitle,
        m.[Type] AS ModuleType,
        m.Category,
        m.[Description] AS ModuleDescription,
        m.Duration,
        m.DurationSeconds,
        m.ContentUrl,
        m.PosterUrl,
        m.PolicyContent,
        a.IsRequired,
        a.DueDate,
        ISNULL(p.[Status], 'NotStarted') AS [Status],
        ISNULL(p.ResumeTimeSeconds, 0) AS ResumeTimeSeconds,
        ISNULL(p.MaxWatchedSeconds, 0) AS MaxWatchedSeconds,
        ISNULL(p.VideoWatchedPercent, 0.00) AS VideoWatchedPercent,
        p.CompletedAt,
        p.ConsentedAt,
        a.IsRecurring,
        ISNULL(a.RecurrenceIntervalDays, rc.RecurrenceIntervalDays) AS RecurrenceIntervalDays,
        ISNULL(a.CompletionDays, ISNULL(rc.CompletionDays, 5)) AS CompletionDays,
        p.ProgressId
    FROM dbo.TrainingAssignments a
    INNER JOIN dbo.TrainingModules m ON a.ModuleId = m.ModuleId AND m.IsActive = 1
    LEFT JOIN dbo.TrainingProgress p ON a.UserId = p.UserId AND a.ModuleId = p.ModuleId
    LEFT JOIN dbo.RecurringTrainingConfig rc ON m.ModuleId = rc.ModuleId AND rc.IsActive = 1
    WHERE a.UserId = @UserId AND a.IsActive = 1;

    -- Result 2: Module Items
    SELECT 
        i.ItemId,
        i.ModuleId,
        i.Title,
        i.ContentUrl,
        i.OrderIndex,
        i.DurationSeconds
    FROM dbo.TrainingModuleItems i
    INNER JOIN dbo.TrainingAssignments a ON i.ModuleId = a.ModuleId
    WHERE a.UserId = @UserId AND a.IsActive = 1
    ORDER BY i.ModuleId, i.OrderIndex ASC;

    -- Result 3: Item Progress
    SELECT 
        ip.ItemId,
        p.ProgressId,
        ip.ResumeTimeSeconds,
        ip.MaxWatchedSeconds,
        ip.IsCompleted
    FROM dbo.TrainingItemProgress ip
    INNER JOIN dbo.TrainingProgress p ON ip.ProgressId = p.ProgressId
    WHERE p.UserId = @UserId;
END
GO

-- sp_GetAssignmentMatrix returning Category
IF OBJECT_ID(N'dbo.sp_GetAssignmentMatrix', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAssignmentMatrix
GO
CREATE PROCEDURE dbo.sp_GetAssignmentMatrix
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: Employees
    SELECT UserId, EmployeeCode, FullName, Email, Department, [Role], Initials
    FROM dbo.Users
    WHERE IsActive = 1 AND [Role] = 'Employee'
    ORDER BY Department, FullName;

    -- Result 2: Modules
    SELECT ModuleId, Title, [Type], Category, [Description], Duration, IsActive
    FROM dbo.TrainingModules
    WHERE IsActive = 1
    ORDER BY Category, Title;

    -- Result 3: Assignments
    SELECT 
        a.UserId,
        a.ModuleId,
        a.IsActive AS IsAssigned,
        a.IsRequired,
        a.DueDate,
        ISNULL(p.[Status], 'NotStarted') AS [Status]
    FROM dbo.TrainingAssignments a
    LEFT JOIN dbo.TrainingProgress p ON a.UserId = p.UserId AND a.ModuleId = p.ModuleId
    WHERE a.IsActive = 1;
END
GO

-- sp_GetRecurringConfigs returning Category & CompletionDays
IF OBJECT_ID(N'dbo.sp_GetRecurringConfigs', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetRecurringConfigs
GO
CREATE PROCEDURE dbo.sp_GetRecurringConfigs
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        rc.ConfigId,
        rc.ModuleId,
        m.Title AS ModuleTitle,
        m.[Type] AS ModuleType,
        m.Category,
        rc.RecurrenceIntervalDays,
        rc.CompletionDays,
        rc.IsActive,
        u.FullName AS CreatedByName,
        rc.CreatedAt
    FROM dbo.RecurringTrainingConfig rc
    INNER JOIN dbo.TrainingModules m ON rc.ModuleId = m.ModuleId
    LEFT JOIN dbo.Users u ON rc.CreatedBy = u.UserId
    ORDER BY rc.CreatedAt DESC;
END
GO

-- sp_CreateRecurringConfig with CompletionDays
IF OBJECT_ID(N'dbo.sp_CreateRecurringConfig', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateRecurringConfig
GO
CREATE PROCEDURE dbo.sp_CreateRecurringConfig
    @ModuleId               INT,
    @RecurrenceIntervalDays INT,
    @CompletionDays         INT = 5,
    @CreatedBy              INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.RecurringTrainingConfig WHERE ModuleId = @ModuleId)
    BEGIN
        SELECT 0 AS Success, 'Configuration already exists for this module.' AS Message;
        RETURN;
    END

    INSERT INTO dbo.RecurringTrainingConfig (
        ModuleId, RecurrenceIntervalDays, CompletionDays, CreatedBy
    )
    VALUES (
        @ModuleId, @RecurrenceIntervalDays, ISNULL(@CompletionDays, 5), @CreatedBy
    );

    SELECT 1 AS Success, 'Configuration created successfully.' AS Message;
END
GO

-- sp_UpdateRecurringConfig with CompletionDays
IF OBJECT_ID(N'dbo.sp_UpdateRecurringConfig', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateRecurringConfig
GO
CREATE PROCEDURE dbo.sp_UpdateRecurringConfig
    @ConfigId               INT,
    @RecurrenceIntervalDays INT,
    @CompletionDays         INT = 5,
    @IsActive               BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.RecurringTrainingConfig
    SET RecurrenceIntervalDays = @RecurrenceIntervalDays,
        CompletionDays = ISNULL(@CompletionDays, 5),
        IsActive = @IsActive,
        UpdatedAt = SYSUTCDATETIME()
    WHERE ConfigId = @ConfigId;

    SELECT 1 AS Success, 'Configuration updated successfully.' AS Message;
END
GO
