using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using LDPortal.API.Data;
using LDPortal.API.Models.DTOs;

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
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetAllModules";
        command.CommandType = CommandType.StoredProcedure;

        using var reader = await command.ExecuteReaderAsync();
        
        var modulesDict = new Dictionary<int, ModuleDto>();
        
        // Result set 1: Modules
        while (await reader.ReadAsync())
        {
            var module = new ModuleDto
            {
                ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Type = reader.GetString(reader.GetOrdinal("Type")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                Duration = reader.IsDBNull(reader.GetOrdinal("Duration")) ? null : reader.GetString(reader.GetOrdinal("Duration")),
                DurationSeconds = reader.IsDBNull(reader.GetOrdinal("DurationSeconds")) ? null : reader.GetInt32(reader.GetOrdinal("DurationSeconds")),
                ContentUrl = reader.IsDBNull(reader.GetOrdinal("ContentUrl")) ? null : reader.GetString(reader.GetOrdinal("ContentUrl")),
                PosterUrl = reader.IsDBNull(reader.GetOrdinal("PosterUrl")) ? null : reader.GetString(reader.GetOrdinal("PosterUrl")),
                PolicyContent = reader.IsDBNull(reader.GetOrdinal("PolicyContent")) ? null : reader.GetString(reader.GetOrdinal("PolicyContent")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                Items = new List<ModuleItemDto>()
            };
            modulesDict[module.ModuleId] = module;
        }

        // Result set 2: Module Items
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                var moduleId = reader.GetInt32(reader.GetOrdinal("ModuleId"));
                if (modulesDict.TryGetValue(moduleId, out var module))
                {
                    module.Items.Add(new ModuleItemDto
                    {
                        ItemId = reader.GetInt32(reader.GetOrdinal("ItemId")),
                        Title = reader.GetString(reader.GetOrdinal("Title")),
                        ContentUrl = reader.GetString(reader.GetOrdinal("ContentUrl")),
                        OrderIndex = reader.GetInt32(reader.GetOrdinal("OrderIndex")),
                        DurationSeconds = reader.IsDBNull(reader.GetOrdinal("DurationSeconds")) ? null : reader.GetInt32(reader.GetOrdinal("DurationSeconds"))
                    });
                }
            }
        }

        return Ok(ApiResponse<List<ModuleDto>>.Ok(modulesDict.Values.ToList()));
    }

    /// <summary>
    /// Get a specific module by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetModuleById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@ModuleId", id));

        using var reader = await command.ExecuteReaderAsync();
        
        ModuleDto? module = null;
        
        // Result set 1: Module
        if (await reader.ReadAsync())
        {
            module = new ModuleDto
            {
                ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Type = reader.GetString(reader.GetOrdinal("Type")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                Duration = reader.IsDBNull(reader.GetOrdinal("Duration")) ? null : reader.GetString(reader.GetOrdinal("Duration")),
                DurationSeconds = reader.IsDBNull(reader.GetOrdinal("DurationSeconds")) ? null : reader.GetInt32(reader.GetOrdinal("DurationSeconds")),
                ContentUrl = reader.IsDBNull(reader.GetOrdinal("ContentUrl")) ? null : reader.GetString(reader.GetOrdinal("ContentUrl")),
                PosterUrl = reader.IsDBNull(reader.GetOrdinal("PosterUrl")) ? null : reader.GetString(reader.GetOrdinal("PosterUrl")),
                PolicyContent = reader.IsDBNull(reader.GetOrdinal("PolicyContent")) ? null : reader.GetString(reader.GetOrdinal("PolicyContent")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                Items = new List<ModuleItemDto>()
            };
        }

        if (module == null)
            return NotFound(ApiResponse.Fail("Module not found."));

        // Result set 2: Module Items
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                module.Items.Add(new ModuleItemDto
                {
                    ItemId = reader.GetInt32(reader.GetOrdinal("ItemId")),
                    Title = reader.GetString(reader.GetOrdinal("Title")),
                    ContentUrl = reader.GetString(reader.GetOrdinal("ContentUrl")),
                    OrderIndex = reader.GetInt32(reader.GetOrdinal("OrderIndex")),
                    DurationSeconds = reader.IsDBNull(reader.GetOrdinal("DurationSeconds")) ? null : reader.GetInt32(reader.GetOrdinal("DurationSeconds"))
                });
            }
        }

        return Ok(ApiResponse<ModuleDto>.Ok(module));
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

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();
        
        try
        {
            using var command = connection.CreateCommand();
            command.Transaction = transaction;
            command.CommandText = "dbo.sp_CreateModule";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@Title", request.Title));
            command.Parameters.Add(new SqlParameter("@Type", request.Type));
            command.Parameters.Add(new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@Duration", (object?)request.Duration ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@DurationSeconds", (object?)request.DurationSeconds ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@ContentUrl", (object?)request.ContentUrl ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@PosterUrl", (object?)request.PosterUrl ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@PolicyContent", (object?)request.PolicyContent ?? DBNull.Value));

            int moduleId = 0;
            using (var reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    moduleId = Convert.ToInt32(reader["ModuleId"]);
                }
            }

            if (moduleId > 0)
            {
                for (int i = 0; i < request.Items.Count; i++)
                {
                    var item = request.Items[i];
                    using var itemCmd = connection.CreateCommand();
                    itemCmd.Transaction = transaction;
                    itemCmd.CommandText = "dbo.sp_CreateModuleItem";
                    itemCmd.CommandType = CommandType.StoredProcedure;
                    itemCmd.Parameters.Add(new SqlParameter("@ModuleId", moduleId));
                    itemCmd.Parameters.Add(new SqlParameter("@Title", item.Title));
                    itemCmd.Parameters.Add(new SqlParameter("@ContentUrl", item.ContentUrl));
                    itemCmd.Parameters.Add(new SqlParameter("@OrderIndex", i));
                    itemCmd.Parameters.Add(new SqlParameter("@DurationSeconds", (object?)item.DurationSeconds ?? DBNull.Value));
                    await itemCmd.ExecuteNonQueryAsync();
                }
            }

            await transaction.CommitAsync();

            var dto = new ModuleDto
            {
                ModuleId = moduleId,
                Title = request.Title,
                Type = request.Type,
                Description = request.Description,
                Duration = request.Duration,
                DurationSeconds = request.DurationSeconds,
                ContentUrl = request.ContentUrl,
                PosterUrl = request.PosterUrl,
                PolicyContent = request.PolicyContent,
                IsActive = true,
                Items = request.Items.Select((req, index) => new ModuleItemDto
                {
                    ItemId = 0,
                    Title = req.Title,
                    ContentUrl = req.ContentUrl,
                    OrderIndex = index,
                    DurationSeconds = req.DurationSeconds
                }).ToList()
            };

            return CreatedAtAction(nameof(GetById), new { id = moduleId }, ApiResponse<ModuleDto>.Ok(dto, "Module created successfully."));
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
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

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            using var command = connection.CreateCommand();
            command.Transaction = transaction;
            command.CommandText = "dbo.sp_UpdateModule";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@ModuleId", id));
            command.Parameters.Add(new SqlParameter("@Title", request.Title));
            command.Parameters.Add(new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@Duration", (object?)request.Duration ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@DurationSeconds", (object?)request.DurationSeconds ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@ContentUrl", (object?)request.ContentUrl ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@PosterUrl", (object?)request.PosterUrl ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@PolicyContent", (object?)request.PolicyContent ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@IsActive", request.IsActive));

            int rowsAffected = 0;
            using (var reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    rowsAffected = Convert.ToInt32(reader["RowsAffected"]);
                }
            }

            if (rowsAffected == 0)
            {
                return NotFound(ApiResponse.Fail("Module not found."));
            }

            // Delete old items
            using var delCmd = connection.CreateCommand();
            delCmd.Transaction = transaction;
            delCmd.CommandText = "dbo.sp_DeleteModuleItems";
            delCmd.CommandType = CommandType.StoredProcedure;
            delCmd.Parameters.Add(new SqlParameter("@ModuleId", id));
            await delCmd.ExecuteNonQueryAsync();

            // Insert new items
            for (int i = 0; i < request.Items.Count; i++)
            {
                var item = request.Items[i];
                using var itemCmd = connection.CreateCommand();
                itemCmd.Transaction = transaction;
                itemCmd.CommandText = "dbo.sp_CreateModuleItem";
                itemCmd.CommandType = CommandType.StoredProcedure;
                itemCmd.Parameters.Add(new SqlParameter("@ModuleId", id));
                itemCmd.Parameters.Add(new SqlParameter("@Title", item.Title));
                itemCmd.Parameters.Add(new SqlParameter("@ContentUrl", item.ContentUrl));
                itemCmd.Parameters.Add(new SqlParameter("@OrderIndex", i));
                itemCmd.Parameters.Add(new SqlParameter("@DurationSeconds", (object?)item.DurationSeconds ?? DBNull.Value));
                await itemCmd.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();
            return Ok(ApiResponse.Ok("Module updated successfully."));
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
