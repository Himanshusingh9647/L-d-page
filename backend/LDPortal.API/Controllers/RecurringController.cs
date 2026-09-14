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
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetRecurringConfigs";
        command.CommandType = CommandType.StoredProcedure;

        using var reader = await command.ExecuteReaderAsync();
        var configs = new List<RecurringConfigDto>();

        while (await reader.ReadAsync())
        {
            configs.Add(new RecurringConfigDto
            {
                ConfigId = reader.GetInt32(reader.GetOrdinal("ConfigId")),
                ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                ModuleTitle = reader.GetString(reader.GetOrdinal("ModuleTitle")),
                ModuleType = reader.GetString(reader.GetOrdinal("ModuleType")),
                RecurrenceIntervalDays = reader.GetInt32(reader.GetOrdinal("RecurrenceIntervalDays")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                CreatedByName = reader.IsDBNull(reader.GetOrdinal("CreatedByName")) ? null : reader.GetString(reader.GetOrdinal("CreatedByName")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            });
        }

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

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_CreateRecurringConfig";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@ModuleId", request.ModuleId));
        command.Parameters.Add(new SqlParameter("@RecurrenceIntervalDays", request.RecurrenceIntervalDays));
        command.Parameters.Add(new SqlParameter("@CreatedBy", GetCurrentUserId()));

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var success = reader.GetInt32(reader.GetOrdinal("Success")) == 1;
            var message = reader.GetString(reader.GetOrdinal("Message"));
            
            if (success)
                return Ok(ApiResponse.Ok(message));
            else
                return BadRequest(ApiResponse.Fail(message));
        }

        return StatusCode(500, ApiResponse.Fail("Database error."));
    }

    /// <summary>
    /// Update a recurring training configuration
    /// </summary>
    [HttpPut("{configId}")]
    public async Task<IActionResult> Update(int configId, [FromBody] UpdateRecurringConfigRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_UpdateRecurringConfig";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@ConfigId", configId));
        command.Parameters.Add(new SqlParameter("@RecurrenceIntervalDays", request.RecurrenceIntervalDays));
        command.Parameters.Add(new SqlParameter("@IsActive", request.IsActive));

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var success = reader.GetInt32(reader.GetOrdinal("Success")) == 1;
            var message = reader.GetString(reader.GetOrdinal("Message"));
            
            if (success)
                return Ok(ApiResponse.Ok(message));
            else
                return BadRequest(ApiResponse.Fail(message));
        }

        return StatusCode(500, ApiResponse.Fail("Database error."));
    }

    /// <summary>
    /// Delete a recurring training configuration
    /// </summary>
    [HttpDelete("{configId}")]
    public async Task<IActionResult> Delete(int configId)
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_DeleteRecurringConfig";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@ConfigId", configId));

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var success = reader.GetInt32(reader.GetOrdinal("Success")) == 1;
            var message = reader.GetString(reader.GetOrdinal("Message"));
            
            if (success)
                return Ok(ApiResponse.Ok(message));
            else
                return NotFound(ApiResponse.Fail(message));
        }

        return StatusCode(500, ApiResponse.Fail("Database error."));
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }
}
