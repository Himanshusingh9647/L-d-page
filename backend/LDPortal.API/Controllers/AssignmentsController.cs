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
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;
    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get current employee's assignments with progress
    /// </summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var userId = GetCurrentUserId();

        var assignmentsQuery = await _context.TrainingAssignments
            .Include(a => a.Module)
                .ThenInclude(m => m.Items)
            .Where(a => a.UserId == userId && a.IsActive && a.Module.IsActive)
            .ToListAsync();

        var moduleIds = assignmentsQuery.Select(a => a.ModuleId).ToList();
        
        var progresses = await _context.TrainingProgress
            .Include(p => p.ItemProgresses)
            .Where(p => p.UserId == userId && moduleIds.Contains(p.ModuleId))
            .ToDictionaryAsync(p => p.ModuleId);

        var result = assignmentsQuery.Select(ta => {
            var tm = ta.Module;
            progresses.TryGetValue(tm.ModuleId, out var tp);
            
            return new ProgressDto
            {
                ModuleId = tm.ModuleId,
                ModuleTitle = tm.Title,
                ModuleType = tm.Type,
                ModuleDescription = tm.Description,
                Duration = tm.Duration,
                DurationSeconds = tm.DurationSeconds,
                ContentUrl = tm.ContentUrl,
                PosterUrl = tm.PosterUrl,
                PolicyContent = tm.PolicyContent,
                IsRequired = ta.IsRequired,
                DueDate = ta.DueDate,
                Status = tp != null ? tp.Status : "NotStarted",
                ResumeTimeSeconds = tp != null ? tp.ResumeTimeSeconds : 0,
                MaxWatchedSeconds = tp != null ? tp.MaxWatchedSeconds : 0,
                VideoWatchedPercent = tp != null ? tp.VideoWatchedPercent : 0,
                CompletedAt = tp != null ? tp.CompletedAt : null,
                ConsentedAt = tp != null ? tp.ConsentedAt : null,
                IsRecurring = ta.IsRecurring,
                RecurrenceIntervalDays = ta.RecurrenceIntervalDays,
                CompletedItemIds = tp?.ItemProgresses.Where(ip => ip.IsCompleted).Select(ip => ip.ItemId).ToList() ?? new List<int>(),
                ItemProgresses = tp?.ItemProgresses.Select(ip => new ItemProgressDto 
                {
                    ItemId = ip.ItemId,
                    ResumeTimeSeconds = ip.ResumeTimeSeconds,
                    MaxWatchedSeconds = ip.MaxWatchedSeconds,
                    IsCompleted = ip.IsCompleted
                }).ToList() ?? new List<ItemProgressDto>()
            };
        }).OrderBy(dto => dto.Status != "Completed" ? 0 : 1).ThenBy(dto => dto.DueDate).ThenBy(dto => dto.ModuleTitle).ToList();

        return Ok(ApiResponse<List<ProgressDto>>.Ok(result));
    }

    /// <summary>
    /// Get specific employee's assignments (Admin only)
    /// </summary>
    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserAssignments(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(ApiResponse.Fail("User not found."));

        var assignments = await (
            from ta in _context.TrainingAssignments
            join tm in _context.TrainingModules on ta.ModuleId equals tm.ModuleId
            join tp in _context.TrainingProgress
                on new { ta.UserId, ta.ModuleId } equals new { tp.UserId, tp.ModuleId } into tpGroup
            from tp in tpGroup.DefaultIfEmpty()
            where ta.UserId == userId && ta.IsActive && tm.IsActive
            orderby tp == null || tp.Status != "Completed" ? 0 : 1, ta.DueDate, tm.Title
            select new ProgressDto
            {
                ModuleId = tm.ModuleId,
                ModuleTitle = tm.Title,
                ModuleType = tm.Type,
                ModuleDescription = tm.Description,
                Duration = tm.Duration,
                DurationSeconds = tm.DurationSeconds,
                ContentUrl = tm.ContentUrl,
                PosterUrl = tm.PosterUrl,
                IsRequired = ta.IsRequired,
                DueDate = ta.DueDate,
                Status = tp != null ? tp.Status : "NotStarted",
                ResumeTimeSeconds = tp != null ? tp.ResumeTimeSeconds : 0,
                MaxWatchedSeconds = tp != null ? tp.MaxWatchedSeconds : 0,
                VideoWatchedPercent = tp != null ? tp.VideoWatchedPercent : 0,
                CompletedAt = tp != null ? tp.CompletedAt : null,
                ConsentedAt = tp != null ? tp.ConsentedAt : null,
                IsRecurring = ta.IsRecurring,
                RecurrenceIntervalDays = ta.RecurrenceIntervalDays
            }
        ).ToListAsync();

        return Ok(ApiResponse<List<ProgressDto>>.Ok(assignments));
    }

    /// <summary>
    /// Get full training assignment matrix (Admin only)
    /// </summary>
    [HttpGet("matrix")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetMatrix()
    {
        var employees = await _context.Users
            .Where(u => u.Role == "Employee" && u.IsActive)
            .OrderBy(u => u.FullName)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                EmployeeCode = u.EmployeeCode,
                FullName = u.FullName,
                Email = u.Email,
                Department = u.Department,
                Role = u.Role,
                Initials = u.Initials
            })
            .ToListAsync();

        var modules = await _context.TrainingModules
            .Where(m => m.IsActive)
            .OrderBy(m => m.Title)
            .Select(m => new ModuleDto
            {
                ModuleId = m.ModuleId,
                Title = m.Title,
                Type = m.Type,
                Description = m.Description,
                Duration = m.Duration,
                IsActive = m.IsActive
            })
            .ToListAsync();

        var assignments = await (
            from ta in _context.TrainingAssignments
            join tp in _context.TrainingProgress
                on new { ta.UserId, ta.ModuleId } equals new { tp.UserId, tp.ModuleId } into tpGroup
            from tp in tpGroup.DefaultIfEmpty()
            where ta.IsActive
            select new MatrixCellDto
            {
                UserId = ta.UserId,
                ModuleId = ta.ModuleId,
                IsAssigned = true,
                IsRequired = ta.IsRequired,
                DueDate = ta.DueDate,
                Status = tp != null ? tp.Status : "NotStarted"
            }
        ).ToListAsync();

        var matrix = new TrainingMatrixDto
        {
            Employees = employees,
            Modules = modules,
            Assignments = assignments
        };

        return Ok(ApiResponse<TrainingMatrixDto>.Ok(matrix));
    }

    /// <summary>
    /// Assign modules to employees (Admin only) — the training selection matrix
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAssignments([FromBody] CreateAssignmentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        if (request.UserIds.Count == 0 || request.ModuleIds.Count == 0)
            return BadRequest(ApiResponse.Fail("At least one user and one module must be specified."));

        var adminId = GetCurrentUserId();
        var created = 0;
        var skipped = 0;

        foreach (var userId in request.UserIds)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId && u.IsActive);
            if (!userExists) continue;

            foreach (var moduleId in request.ModuleIds)
            {
                var moduleExists = await _context.TrainingModules.AnyAsync(m => m.ModuleId == moduleId && m.IsActive);
                if (!moduleExists) continue;

                // Check if assignment already exists
                var existing = await _context.TrainingAssignments
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.ModuleId == moduleId);

                if (existing != null)
                {
                    if (!existing.IsActive)
                    {
                        existing.IsActive = true;
                        existing.IsRequired = request.IsRequired;
                        existing.DueDate = request.DueDate;
                        existing.AssignedBy = adminId;
                        existing.AssignedAt = DateTime.UtcNow;
                        created++;
                    }
                    else
                    {
                        skipped++;
                    }
                    continue;
                }

                var assignment = new TrainingAssignment
                {
                    UserId = userId,
                    ModuleId = moduleId,
                    IsRequired = request.IsRequired,
                    DueDate = request.DueDate,
                    AssignedBy = adminId,
                    AssignedAt = DateTime.UtcNow
                };

                _context.TrainingAssignments.Add(assignment);
                created++;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse.Ok($"Successfully assigned {created} training(s). {skipped} already existed."));
    }

    /// <summary>
    /// Remove an assignment (Admin only)
    /// </summary>
    [HttpDelete]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveAssignment([FromBody] RemoveAssignmentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var assignment = await _context.TrainingAssignments
            .FirstOrDefaultAsync(a => a.UserId == request.UserId && a.ModuleId == request.ModuleId && a.IsActive);

        if (assignment == null)
            return NotFound(ApiResponse.Fail("Assignment not found."));

        assignment.IsActive = false;
        await _context.SaveChangesAsync();

        var adminId = GetCurrentUserId();
        return Ok(ApiResponse.Ok("Assignment removed successfully."));
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }
}
