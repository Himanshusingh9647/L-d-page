using Microsoft.EntityFrameworkCore;
using LDPortal.API.Data;

namespace LDPortal.API.Services;

/// <summary>
/// Background service that processes recurring trainings on a schedule.
/// Acts as a fallback when SQL Agent is not available (e.g., SQL Express).
/// </summary>
public class RecurringTrainingService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RecurringTrainingService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(6); // Check every 6 hours

    public RecurringTrainingService(IServiceScopeFactory scopeFactory, ILogger<RecurringTrainingService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RecurringTrainingService started. Checking every {Interval} hours.", _interval.TotalHours);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRecurringTrainings(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recurring trainings.");
            }

            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task ProcessRecurringTrainings(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTime.UtcNow;

        // Find completed trainings that have exceeded their recurrence interval
        var recurringItems = await (
            from tp in context.TrainingProgress
            join rc in context.RecurringTrainingConfigs on tp.ModuleId equals rc.ModuleId
            join ta in context.TrainingAssignments on new { tp.UserId, tp.ModuleId } equals new { ta.UserId, ta.ModuleId }
            where tp.Status == "Completed"
               && tp.CompletedAt != null
               && rc.IsActive
               && ta.IsActive
               && tp.CompletedAt.Value.AddDays(rc.RecurrenceIntervalDays) <= now
            select new
            {
                tp.ProgressId,
                tp.UserId,
                tp.ModuleId,
                ta.AssignmentId,
                rc.RecurrenceIntervalDays
            }
        ).ToListAsync(ct);

        if (recurringItems.Count == 0)
        {
            _logger.LogDebug("No recurring trainings to process.");
            return;
        }

        _logger.LogInformation("Processing {Count} recurring training reset(s).", recurringItems.Count);

        foreach (var item in recurringItems)
        {
            // Reset progress
            var progress = await context.TrainingProgress.FindAsync(new object[] { item.ProgressId }, ct);
            if (progress != null)
            {
                progress.Status = "NotStarted";
                progress.ResumeTimeSeconds = 0;
                progress.MaxWatchedSeconds = 0;
                progress.VideoWatchedPercent = 0;
                progress.CompletedAt = null;
                progress.ConsentedAt = null;
                progress.UpdatedAt = now;
            }

            // Update due date on assignment
            var assignment = await context.TrainingAssignments.FindAsync(new object[] { item.AssignmentId }, ct);
            if (assignment != null)
            {
                assignment.DueDate = now.AddDays(item.RecurrenceIntervalDays);
            }
        }


        await context.SaveChangesAsync(ct);
        _logger.LogInformation("Successfully reset {Count} recurring training(s).", recurringItems.Count);
    }
}
