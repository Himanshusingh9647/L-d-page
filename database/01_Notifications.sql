USE [LDTrainingPortal]
GO

-- 1. Create Notifications Table
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        NotificationId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(100) NOT NULL,
        Message NVARCHAR(500) NOT NULL,
        [Type] NVARCHAR(50) NOT NULL, -- 'Assignment', 'Deadline', 'System'
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    )
    
    CREATE NONCLUSTERED INDEX IX_Notifications_UserId ON dbo.Notifications(UserId, IsRead, CreatedAt DESC)
    PRINT 'Table [dbo.Notifications] created.'
END
GO

-- 2. Modify sp_CreateAssignment to generate notification
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

    DECLARE @ModuleTitle NVARCHAR(300)
    SELECT @ModuleTitle = Title FROM dbo.TrainingModules WHERE ModuleId = @ModuleId

    IF @ExistingId IS NOT NULL
    BEGIN
        IF @ExistingActive = 0
        BEGIN
            -- Re-activate
            UPDATE dbo.TrainingAssignments
            SET IsActive = 1, IsRequired = @IsRequired, DueDate = @DueDate,
                AssignedBy = @AssignedBy, AssignedAt = SYSUTCDATETIME()
            WHERE AssignmentId = @ExistingId

            -- Generate Notification
            INSERT INTO dbo.Notifications (UserId, Title, Message, [Type])
            VALUES (@UserId, 'Training Re-assigned', 'You have been re-assigned to training: ' + @ModuleTitle, 'Assignment')

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

    -- Generate Notification
    DECLARE @Msg NVARCHAR(500) = 'You have been assigned a new training module: ' + @ModuleTitle
    IF @DueDate IS NOT NULL
    BEGIN
        SET @Msg = @Msg + '. Due by ' + CONVERT(VARCHAR, @DueDate, 107)
    END

    INSERT INTO dbo.Notifications (UserId, Title, Message, [Type])
    VALUES (@UserId, 'New Training Assigned', @Msg, 'Assignment')

    SELECT 1 AS Created, 0 AS Skipped, 'Assigned' AS Message
END
GO

-- 3. Procedure to get notifications
IF OBJECT_ID(N'dbo.sp_GetNotifications', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetNotifications
GO
CREATE PROCEDURE dbo.sp_GetNotifications
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 50
        NotificationId,
        Title,
        Message,
        [Type],
        IsRead,
        CreatedAt
    FROM dbo.Notifications
    WHERE UserId = @UserId
    ORDER BY CreatedAt DESC
END
GO

-- 4. Procedure to mark read
IF OBJECT_ID(N'dbo.sp_MarkNotificationRead', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_MarkNotificationRead
GO
CREATE PROCEDURE dbo.sp_MarkNotificationRead
    @NotificationId INT,
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Notifications
    SET IsRead = 1
    WHERE NotificationId = @NotificationId AND UserId = @UserId

    SELECT @@ROWCOUNT AS RowsAffected
END
GO

-- 5. Background Procedure for Deadlines (3 days or less)
IF OBJECT_ID(N'dbo.sp_GenerateDeadlineNotifications', N'P') IS NOT NULL DROP PROCEDURE dbo.sp_GenerateDeadlineNotifications
GO
CREATE PROCEDURE dbo.sp_GenerateDeadlineNotifications
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(SYSUTCDATETIME() AS DATE)
    DECLARE @TargetDate DATE = DATEADD(day, 3, @Today)

    -- Find all assignments due in exactly 3 days or already overdue that are NOT completed
    -- AND for which we haven't already sent a deadline notification in the last 2 days
    
    INSERT INTO dbo.Notifications (UserId, Title, Message, [Type])
    SELECT 
        ta.UserId,
        'Deadline Approaching',
        'Your training "' + tm.Title + '" is due on ' + CONVERT(VARCHAR, ta.DueDate, 107) + '. Please complete it soon.',
        'Deadline'
    FROM dbo.TrainingAssignments ta
    INNER JOIN dbo.TrainingModules tm ON tm.ModuleId = ta.ModuleId
    LEFT JOIN dbo.TrainingProgress tp ON tp.UserId = ta.UserId AND tp.ModuleId = ta.ModuleId
    WHERE ta.IsActive = 1
      AND ta.DueDate IS NOT NULL
      AND ta.DueDate <= @TargetDate
      AND ISNULL(tp.[Status], 'NotStarted') != 'Completed'
      AND NOT EXISTS (
          SELECT 1 FROM dbo.Notifications n 
          WHERE n.UserId = ta.UserId 
            AND n.[Type] = 'Deadline'
            AND n.Message LIKE '%' + tm.Title + '%'
            AND n.CreatedAt >= DATEADD(day, -2, SYSUTCDATETIME())
      )

END
GO
