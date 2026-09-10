USE LDTrainingPortal;
GO

-- Create TrainingModuleItems table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TrainingModuleItems')
BEGIN
    CREATE TABLE TrainingModuleItems (
        ItemId INT IDENTITY(1,1) PRIMARY KEY,
        ModuleId INT NOT NULL,
        Title NVARCHAR(300) NOT NULL,
        ContentUrl NVARCHAR(1000) NOT NULL,
        OrderIndex INT NOT NULL DEFAULT 0,
        DurationSeconds INT NULL,
        CONSTRAINT FK_TrainingModuleItems_TrainingModules FOREIGN KEY (ModuleId) REFERENCES TrainingModules(ModuleId) ON DELETE CASCADE
    );
END
GO

-- Create TrainingItemProgress table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TrainingItemProgress')
BEGIN
    CREATE TABLE TrainingItemProgress (
        ItemProgressId INT IDENTITY(1,1) PRIMARY KEY,
        ProgressId INT NOT NULL,
        ItemId INT NOT NULL,
        ResumeTimeSeconds INT NOT NULL DEFAULT 0,
        MaxWatchedSeconds INT NOT NULL DEFAULT 0,
        IsCompleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_TrainingItemProgress_TrainingProgress FOREIGN KEY (ProgressId) REFERENCES TrainingProgress(ProgressId) ON DELETE CASCADE,
        CONSTRAINT FK_TrainingItemProgress_TrainingModuleItems FOREIGN KEY (ItemId) REFERENCES TrainingModuleItems(ItemId)
    );
    
    CREATE UNIQUE INDEX IX_TrainingItemProgress_Progress_Item ON TrainingItemProgress(ProgressId, ItemId);
END
GO
