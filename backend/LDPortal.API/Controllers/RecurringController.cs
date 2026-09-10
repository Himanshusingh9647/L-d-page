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
[Authorize(Roles = "Admin")]
public class RecurringController : ControllerBase
{
    private readonly AppDbContext _context;
    public RecurringController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all recurring training configurations
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var configs = await _context.RecurringTrainingConfigs
            .Include(rc => rc.Module)
            .Include(rc => rc.Creator)
            .OrderBy(rc => rc.Module.Title)
            .Select(rc => new RecurringConfigDto
            {
                ConfigId = rc.ConfigId,
                ModuleId = rc.ModuleId,
                ModuleTitle = rc.Module.Title,
                ModuleType = rc.Module.Type,
                RecurrenceIntervalDays = rc.RecurrenceIntervalDays,
                IsActive = rc.IsActive,
                CreatedByName = rc.Creator != null ? rc.Creator.FullName : null,
                CreatedAt = rc.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<List<RecurringConfigDto>>.Ok(configs));
    }

    /// <summary>
    /// Create a recurring training configuration
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRecurringConfigRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        // Check module exists
        var module = await _context.TrainingModules.FindAsync(request.ModuleId);
        if (module == null || !module.IsActive)
            return NotFound(ApiResponse.Fail("Module not found."));

        // Check if config already exists for this module
        var existing = await _context.RecurringTrainingConfigs
            .FirstOrDefaultAsync(rc => rc.ModuleId == request.ModuleId);

        if (existing != null)
        {
            existing.RecurrenceIntervalDays = request.RecurrenceIntervalDays;
            existing.IsActive = true;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var config = new RecurringTrainingConfig
            {
                ModuleId = request.ModuleId,
                RecurrenceIntervalDays = request.RecurrenceIntervalDays,
                CreatedBy = GetCurrentUserId(),
                CreatedAt = DateTime.UtcNow
            };
            _context.RecurringTrainingConfigs.Add(config);
        }

        // Also update assignments for this module to mark them as recurring
        var assignments = await _context.TrainingAssignments
            .Where(a => a.ModuleId == request.ModuleId && a.IsActive)
            .ToListAsync();

        foreach (var assignment in assignments)
        {
            assignment.IsRecurring = true;
            assignment.RecurrenceIntervalDays = request.RecurrenceIntervalDays;
        }

        await _context.SaveChangesAsync();

        var adminId = GetCurrentUserId();
        return Ok(ApiResponse.Ok($"Recurring training configured for '{module.Title}' every {request.RecurrenceIntervalDays} days."));
    }

    /// <summary>
    /// Update a recurring training configuration
    /// </summary>
    [HttpPut("{configId}")]
    public async Task<IActionResult> Update(int configId, [FromBody] UpdateRecurringConfigRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var config = await _context.RecurringTrainingConfigs
            .Include(rc => rc.Module)
            .FirstOrDefaultAsync(rc => rc.ConfigId == configId);

        if (config == null)
            return NotFound(ApiResponse.Fail("Recurring configuration not found."));

        config.RecurrenceIntervalDays = request.RecurrenceIntervalDays;
        config.IsActive = request.IsActive;
        config.UpdatedAt = DateTime.UtcNow;

        // Update related assignments
        var assignments = await _context.TrainingAssignments
            .Where(a => a.ModuleId == config.ModuleId && a.IsActive)
            .ToListAsync();

        foreach (var assignment in assignments)
        {
            assignment.IsRecurring = request.IsActive;
            assignment.RecurrenceIntervalDays = request.IsActive ? request.RecurrenceIntervalDays : null;
        }

        await _context.SaveChangesAsync();

        var adminId = GetCurrentUserId();
        return Ok(ApiResponse.Ok("Recurring configuration updated successfully."));
    }

    /// <summary>
    /// Delete a recurring training configuration
    /// </summary>
    [HttpDelete("{configId}")]
    public async Task<IActionResult> Delete(int configId)
    {
        var config = await _context.RecurringTrainingConfigs
            .Include(rc => rc.Module)
            .FirstOrDefaultAsync(rc => rc.ConfigId == configId);

        if (config == null)
            return NotFound(ApiResponse.Fail("Recurring configuration not found."));

        config.IsActive = false;
        config.UpdatedAt = DateTime.UtcNow;

        // Remove recurring flag from assignments
        var assignments = await _context.TrainingAssignments
            .Where(a => a.ModuleId == config.ModuleId && a.IsActive)
            .ToListAsync();

        foreach (var assignment in assignments)
        {
            assignment.IsRecurring = false;
            assignment.RecurrenceIntervalDays = null;
        }

        await _context.SaveChangesAsync();

        var adminId = GetCurrentUserId();
        return Ok(ApiResponse.Ok("Recurring configuration disabled successfully."));
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }
}
