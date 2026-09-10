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
public class ModulesController : ControllerBase
{
    private readonly AppDbContext _context;
    public ModulesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all active training modules
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var modules = await _context.TrainingModules
            .Include(m => m.Items)
            .Where(m => m.IsActive)
            .OrderBy(m => m.Title)
            .Select(m => new ModuleDto
            {
                ModuleId = m.ModuleId,
                Title = m.Title,
                Type = m.Type,
                Description = m.Description,
                Duration = m.Duration,
                DurationSeconds = m.DurationSeconds,
                ContentUrl = m.ContentUrl,
                PosterUrl = m.PosterUrl,
                PolicyContent = m.PolicyContent,
                IsActive = m.IsActive,
                Items = m.Items.OrderBy(i => i.OrderIndex).Select(i => new ModuleItemDto
                {
                    ItemId = i.ItemId,
                    Title = i.Title,
                    ContentUrl = i.ContentUrl,
                    OrderIndex = i.OrderIndex,
                    DurationSeconds = i.DurationSeconds
                }).ToList()
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ModuleDto>>.Ok(modules));
    }

    /// <summary>
    /// Get a specific module by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var module = await _context.TrainingModules
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.ModuleId == id);
            
        if (module == null || !module.IsActive)
            return NotFound(ApiResponse.Fail("Module not found."));

        var dto = new ModuleDto
        {
            ModuleId = module.ModuleId,
            Title = module.Title,
            Type = module.Type,
            Description = module.Description,
            Duration = module.Duration,
            DurationSeconds = module.DurationSeconds,
            ContentUrl = module.ContentUrl,
            PosterUrl = module.PosterUrl,
            PolicyContent = module.PolicyContent,
            IsActive = module.IsActive,
            Items = module.Items.OrderBy(i => i.OrderIndex).Select(i => new ModuleItemDto
            {
                ItemId = i.ItemId,
                Title = i.Title,
                ContentUrl = i.ContentUrl,
                OrderIndex = i.OrderIndex,
                DurationSeconds = i.DurationSeconds
            }).ToList()
        };

        return Ok(ApiResponse<ModuleDto>.Ok(dto));
    }

    /// <summary>
    /// Create a new training module (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateModuleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        if (request.Type != "Video" && request.Type != "PDF")
            return BadRequest(ApiResponse.Fail("Module type must be 'Video' or 'PDF'."));

        var module = new TrainingModule
        {
            Title = request.Title,
            Type = request.Type,
            Description = request.Description,
            Duration = request.Duration,
            DurationSeconds = request.DurationSeconds,
            ContentUrl = request.ContentUrl,
            PosterUrl = request.PosterUrl,
            PolicyContent = request.PolicyContent,
            Items = request.Items.Select((req, index) => new TrainingModuleItem
            {
                Title = req.Title,
                ContentUrl = req.ContentUrl,
                DurationSeconds = req.DurationSeconds,
                OrderIndex = index
            }).ToList()
        };

        _context.TrainingModules.Add(module);
        await _context.SaveChangesAsync();

        var userId = GetCurrentUserId();
        return CreatedAtAction(nameof(GetById), new { id = module.ModuleId },
            ApiResponse<ModuleDto>.Ok(new ModuleDto
            {
                ModuleId = module.ModuleId,
                Title = module.Title,
                Type = module.Type,
                Description = module.Description,
                Duration = module.Duration,
                DurationSeconds = module.DurationSeconds,
                ContentUrl = module.ContentUrl,
                PosterUrl = module.PosterUrl,
                PolicyContent = module.PolicyContent,
                IsActive = module.IsActive,
                Items = module.Items.Select(i => new ModuleItemDto
                {
                    ItemId = i.ItemId,
                    Title = i.Title,
                    ContentUrl = i.ContentUrl,
                    OrderIndex = i.OrderIndex,
                    DurationSeconds = i.DurationSeconds
                }).ToList()
            }, "Module created successfully."));
    }

    /// <summary>
    /// Update an existing module (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateModuleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var module = await _context.TrainingModules
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.ModuleId == id);
            
        if (module == null)
            return NotFound(ApiResponse.Fail("Module not found."));

        module.Title = request.Title;
        module.Description = request.Description;
        module.Duration = request.Duration;
        module.DurationSeconds = request.DurationSeconds;
        module.ContentUrl = request.ContentUrl;
        module.PosterUrl = request.PosterUrl;
        module.PolicyContent = request.PolicyContent;
        module.IsActive = request.IsActive;
        module.UpdatedAt = DateTime.UtcNow;

        // Simple sync: remove old items, add new items (in a real app, you might want to merge them to keep progress)
        _context.TrainingModuleItems.RemoveRange(module.Items);
        module.Items = request.Items.Select((req, index) => new TrainingModuleItem
        {
            Title = req.Title,
            ContentUrl = req.ContentUrl,
            DurationSeconds = req.DurationSeconds,
            OrderIndex = index
        }).ToList();

        await _context.SaveChangesAsync();

        var userId = GetCurrentUserId();
        return Ok(ApiResponse.Ok("Module updated successfully."));
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }
}
