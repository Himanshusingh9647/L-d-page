using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LDPortal.API.Data;
using LDPortal.API.Models.DTOs;
using LDPortal.API.Models.Entities;
using LDPortal.API.Services;

namespace LDPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _context;
    public ProgressController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Save video resume time (auto-save while watching)
    /// </summary>
    [HttpPut("video-time")]
    public async Task<IActionResult> UpdateVideoTime([FromBody] UpdateVideoTimeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var userId = GetCurrentUserId();
        
        // Verify the user has this assignment
        var hasAssignment = await _context.TrainingAssignments
            .AnyAsync(a => a.UserId == userId && a.ModuleId == request.ModuleId && a.IsActive);
        if (!hasAssignment)
            return BadRequest(ApiResponse.Fail("You are not assigned to this training module."));

        var progress = await _context.TrainingProgress
            .Include(p => p.ItemProgresses)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ModuleId == request.ModuleId);

        if (progress == null)
        {
            progress = new TrainingProgress
            {
                UserId = userId,
                ModuleId = request.ModuleId,
                Status = "InProgress",
                ResumeTimeSeconds = 0,
                MaxWatchedSeconds = 0,
                VideoWatchedPercent = 0,
                CreatedAt = DateTime.UtcNow
            };
            _context.TrainingProgress.Add(progress);
            await _context.SaveChangesAsync(); // Save to get ProgressId
        }

        if (progress.Status != "Completed")
        {
            progress.Status = "InProgress";
            progress.UpdatedAt = DateTime.UtcNow;
            
            var itemProgress = progress.ItemProgresses.FirstOrDefault(ip => ip.ItemId == request.ItemId);
            if (itemProgress == null)
            {
                itemProgress = new TrainingItemProgress
                {
                    ProgressId = progress.ProgressId,
                    ItemId = request.ItemId,
                    ResumeTimeSeconds = request.ResumeTimeSeconds,
                    MaxWatchedSeconds = request.MaxWatchedSeconds
                };
                _context.TrainingItemProgress.Add(itemProgress);
            }
            else if (!itemProgress.IsCompleted)
            {
                itemProgress.ResumeTimeSeconds = request.ResumeTimeSeconds;
                itemProgress.MaxWatchedSeconds = Math.Max(itemProgress.MaxWatchedSeconds, request.MaxWatchedSeconds);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Video progress saved."));
    }

    /// <summary>
    /// Mark video as fully watched and completed
    /// </summary>
    [HttpPut("complete-video")]
    public async Task<IActionResult> CompleteVideo([FromBody] CompleteVideoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var userId = GetCurrentUserId();

        // Verify assignment
        var hasAssignment = await _context.TrainingAssignments
            .AnyAsync(a => a.UserId == userId && a.ModuleId == request.ModuleId && a.IsActive);
        if (!hasAssignment)
            return BadRequest(ApiResponse.Fail("You are not assigned to this training module."));

        // Verify module is a video
        var module = await _context.TrainingModules
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.ModuleId == request.ModuleId);
            
        if (module == null || module.Type != "Video")
            return BadRequest(ApiResponse.Fail("Invalid video module."));

        var progress = await _context.TrainingProgress
            .Include(p => p.ItemProgresses)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ModuleId == request.ModuleId);

        var now = DateTime.UtcNow;

        if (progress == null)
        {
            progress = new TrainingProgress
            {
                UserId = userId,
                ModuleId = request.ModuleId,
                Status = "InProgress",
                CreatedAt = now
            };
            _context.TrainingProgress.Add(progress);
            await _context.SaveChangesAsync(); // get ID
        }

        var itemProgress = progress.ItemProgresses.FirstOrDefault(ip => ip.ItemId == request.ItemId);
        if (itemProgress == null)
        {
            itemProgress = new TrainingItemProgress
            {
                ProgressId = progress.ProgressId,
                ItemId = request.ItemId,
                IsCompleted = true
            };
            _context.TrainingItemProgress.Add(itemProgress);
        }
        else
        {
            itemProgress.IsCompleted = true;
        }
        
        await _context.SaveChangesAsync();

        // Check if all items in the module are now completed
        var allItemIds = module.Items.Select(i => i.ItemId).ToList();
        var completedItemIds = await _context.TrainingItemProgress
            .Where(ip => ip.ProgressId == progress.ProgressId && ip.IsCompleted)
            .Select(ip => ip.ItemId)
            .ToListAsync();

        if (allItemIds.All(id => completedItemIds.Contains(id)))
        {
            progress.Status = "Completed";
            progress.CompletedAt = now;
            progress.VideoWatchedPercent = 100;
            progress.UpdatedAt = now;
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse.Ok($"Item marked as complete."));
    }

    /// <summary>
    /// Record PDF consent with timestamp
    /// </summary>
    [HttpPut("consent-pdf")]
    public async Task<IActionResult> ConsentPdf([FromBody] ConsentPdfRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var userId = GetCurrentUserId();

        // Verify assignment
        var hasAssignment = await _context.TrainingAssignments
            .AnyAsync(a => a.UserId == userId && a.ModuleId == request.ModuleId && a.IsActive);
        if (!hasAssignment)
            return BadRequest(ApiResponse.Fail("You are not assigned to this training module."));

        // Verify module is a PDF
        var module = await _context.TrainingModules.FindAsync(request.ModuleId);
        if (module == null || module.Type != "PDF")
            return BadRequest(ApiResponse.Fail("Invalid PDF module."));

        var progress = await _context.TrainingProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ModuleId == request.ModuleId);

        var now = DateTime.UtcNow;

        if (progress == null)
        {
            progress = new TrainingProgress
            {
                UserId = userId,
                ModuleId = request.ModuleId,
                Status = "Completed",
                ConsentedAt = now,
                CompletedAt = now,
                CreatedAt = now
            };
            _context.TrainingProgress.Add(progress);
        }
        else
        {
            progress.Status = "Completed";
            progress.ConsentedAt = now;
            progress.CompletedAt = now;
            progress.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Consent recorded for '{module.Title}'."));
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }
}
