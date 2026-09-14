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

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_UpsertVideoProgress";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UserId", userId));
        command.Parameters.Add(new SqlParameter("@ModuleId", request.ModuleId));
        command.Parameters.Add(new SqlParameter("@ItemId", request.ItemId));
        command.Parameters.Add(new SqlParameter("@ResumeTimeSeconds", request.ResumeTimeSeconds));
        command.Parameters.Add(new SqlParameter("@MaxWatchedSeconds", request.MaxWatchedSeconds));

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
    /// Mark video as fully watched and completed
    /// </summary>
    [HttpPut("complete-video")]
    public async Task<IActionResult> CompleteVideo([FromBody] CompleteVideoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var userId = GetCurrentUserId();

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_CompleteVideoItem";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UserId", userId));
        command.Parameters.Add(new SqlParameter("@ModuleId", request.ModuleId));
        command.Parameters.Add(new SqlParameter("@ItemId", request.ItemId));

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
    /// Record PDF consent with timestamp
    /// </summary>
    [HttpPut("consent-pdf")]
    public async Task<IActionResult> ConsentPdf([FromBody] ConsentPdfRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var userId = GetCurrentUserId();

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_ConsentPdf";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UserId", userId));
        command.Parameters.Add(new SqlParameter("@ModuleId", request.ModuleId));

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

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }
}
