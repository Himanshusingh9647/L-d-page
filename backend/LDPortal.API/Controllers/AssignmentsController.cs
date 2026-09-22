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
        return await GetUserAssignmentsInternal(userId);
    }

    /// <summary>
    /// Get specific employee's assignments (Admin only)
    /// </summary>
    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserAssignments(int userId)
    {
        return await GetUserAssignmentsInternal(userId);
    }

    private async Task<IActionResult> GetUserAssignmentsInternal(int userId)
    {
        var resultList = new List<ProgressDto>
        {
            new ProgressDto
            {
<<<<<<< HEAD
                ModuleId = 1,
                ModuleTitle = "Company Code of Conduct",
                ModuleType = "Video",
                ModuleDescription = "Annual required compliance training regarding workplace ethics and conduct.",
                Duration = "15 mins",
                IsRequired = true,
                DueDate = DateTime.UtcNow.AddDays(-2), // Overdue
                Status = "NotStarted"
            },
            new ProgressDto
=======
                ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                ModuleTitle = reader.GetString(reader.GetOrdinal("ModuleTitle")),
                ModuleType = reader.GetString(reader.GetOrdinal("ModuleType")),
                Category = HasColumn(reader, "Category") && !reader.IsDBNull(reader.GetOrdinal("Category")) ? reader.GetString(reader.GetOrdinal("Category")) : "HR",
                ModuleDescription = reader.IsDBNull(reader.GetOrdinal("ModuleDescription")) ? null : reader.GetString(reader.GetOrdinal("ModuleDescription")),
                Duration = reader.IsDBNull(reader.GetOrdinal("Duration")) ? null : reader.GetString(reader.GetOrdinal("Duration")),
                DurationSeconds = reader.IsDBNull(reader.GetOrdinal("DurationSeconds")) ? null : reader.GetInt32(reader.GetOrdinal("DurationSeconds")),
                ContentUrl = reader.IsDBNull(reader.GetOrdinal("ContentUrl")) ? null : reader.GetString(reader.GetOrdinal("ContentUrl")),
                PosterUrl = reader.IsDBNull(reader.GetOrdinal("PosterUrl")) ? null : reader.GetString(reader.GetOrdinal("PosterUrl")),
                PolicyContent = reader.IsDBNull(reader.GetOrdinal("PolicyContent")) ? null : reader.GetString(reader.GetOrdinal("PolicyContent")),
                IsRequired = reader.GetBoolean(reader.GetOrdinal("IsRequired")),
                DueDate = reader.IsDBNull(reader.GetOrdinal("DueDate")) ? null : reader.GetDateTime(reader.GetOrdinal("DueDate")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                ResumeTimeSeconds = reader.GetInt32(reader.GetOrdinal("ResumeTimeSeconds")),
                MaxWatchedSeconds = reader.GetInt32(reader.GetOrdinal("MaxWatchedSeconds")),
                VideoWatchedPercent = reader.GetDecimal(reader.GetOrdinal("VideoWatchedPercent")),
                CompletedAt = reader.IsDBNull(reader.GetOrdinal("CompletedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("CompletedAt")),
                ConsentedAt = reader.IsDBNull(reader.GetOrdinal("ConsentedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("ConsentedAt")),
                IsRecurring = reader.GetBoolean(reader.GetOrdinal("IsRecurring")),
                RecurrenceIntervalDays = reader.IsDBNull(reader.GetOrdinal("RecurrenceIntervalDays")) ? null : reader.GetInt32(reader.GetOrdinal("RecurrenceIntervalDays")),
                CompletionDays = HasColumn(reader, "CompletionDays") && !reader.IsDBNull(reader.GetOrdinal("CompletionDays")) ? reader.GetInt32(reader.GetOrdinal("CompletionDays")) : 5,
                ProgressId = reader.IsDBNull(reader.GetOrdinal("ProgressId")) ? 0 : reader.GetInt32(reader.GetOrdinal("ProgressId"))
            };
            progressDict[dto.ModuleId] = dto;
        }

        // Result 2: Module Items
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
            {
                ModuleId = 2,
                ModuleTitle = "Information Security Basics",
                ModuleType = "Video",
                ModuleDescription = "Learn how to protect company assets and avoid phishing attacks.",
                Duration = "20 mins",
                IsRequired = true,
                DueDate = DateTime.UtcNow.AddDays(3), // Due soon
                Status = "InProgress",
                VideoWatchedPercent = 45m
            },
            new ProgressDto
            {
                ModuleId = 3,
                ModuleTitle = "Leadership Principles",
                ModuleType = "Document",
                ModuleDescription = "Core leadership values for prospective managers.",
                Duration = "30 mins",
                IsRequired = false,
                DueDate = DateTime.UtcNow.AddDays(14), // Up next
                Status = "NotStarted"
            },
            new ProgressDto
            {
                ModuleId = 4,
                ModuleTitle = "Workplace Safety",
                ModuleType = "Video",
                ModuleDescription = "General office safety guidelines.",
                Duration = "10 mins",
                IsRequired = true,
                DueDate = DateTime.UtcNow.AddDays(-10), 
                Status = "Completed",
                CompletedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        return Ok(ApiResponse<List<ProgressDto>>.Ok(resultList));
    }

    /// <summary>
    /// Get full training assignment matrix (Admin only)
    /// </summary>
    [HttpGet("matrix")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetMatrix()
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetAssignmentMatrix";
        command.CommandType = CommandType.StoredProcedure;

        using var reader = await command.ExecuteReaderAsync();
        
        var matrix = new TrainingMatrixDto();

        // Result 1: Employees
        while (await reader.ReadAsync())
        {
            matrix.Employees.Add(new UserDto
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                EmployeeCode = reader.GetString(reader.GetOrdinal("EmployeeCode")),
                FullName = reader.GetString(reader.GetOrdinal("FullName")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Department = reader.GetString(reader.GetOrdinal("Department")),
                Role = reader.GetString(reader.GetOrdinal("Role")),
                Initials = reader.GetString(reader.GetOrdinal("Initials"))
            });
        }

        // Result 2: Modules
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                matrix.Modules.Add(new ModuleDto
                {
                    ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                    Title = reader.GetString(reader.GetOrdinal("Title")),
                    Type = reader.GetString(reader.GetOrdinal("Type")),
                    Category = HasColumn(reader, "Category") && !reader.IsDBNull(reader.GetOrdinal("Category")) ? reader.GetString(reader.GetOrdinal("Category")) : "HR",
                    Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                    Duration = reader.IsDBNull(reader.GetOrdinal("Duration")) ? null : reader.GetString(reader.GetOrdinal("Duration")),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
                });
            }
        }

        // Result 3: Assignments
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                matrix.Assignments.Add(new MatrixCellDto
                {
                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                    ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                    IsAssigned = reader.GetBoolean(reader.GetOrdinal("IsAssigned")),
                    IsRequired = reader.GetBoolean(reader.GetOrdinal("IsRequired")),
                    DueDate = reader.IsDBNull(reader.GetOrdinal("DueDate")) ? null : reader.GetDateTime(reader.GetOrdinal("DueDate")),
                    Status = reader.GetString(reader.GetOrdinal("Status"))
                });
            }
        }

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

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();

        var dueDate = request.DueDate;
        if (dueDate == null && request.CompletionDays.HasValue && request.CompletionDays.Value > 0)
        {
            dueDate = DateTime.UtcNow.Date.AddDays(request.CompletionDays.Value);
        }

        foreach (var userId in request.UserIds)
        {
            foreach (var moduleId in request.ModuleIds)
            {
                using var command = connection.CreateCommand();
                command.CommandText = "dbo.sp_CreateAssignment";
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new SqlParameter("@UserId", userId));
                command.Parameters.Add(new SqlParameter("@ModuleId", moduleId));
                command.Parameters.Add(new SqlParameter("@IsRequired", request.IsRequired));
                command.Parameters.Add(new SqlParameter("@DueDate", (object?)dueDate ?? DBNull.Value));
                command.Parameters.Add(new SqlParameter("@AssignedBy", adminId));
                command.Parameters.Add(new SqlParameter("@IsRecurring", request.IsRecurring));
                command.Parameters.Add(new SqlParameter("@RecurrenceIntervalDays", (object?)request.RecurrenceIntervalDays ?? DBNull.Value));
                command.Parameters.Add(new SqlParameter("@CompletionDays", (object?)request.CompletionDays ?? 5));

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    created += reader.GetInt32(reader.GetOrdinal("Created"));
                    skipped += reader.GetInt32(reader.GetOrdinal("Skipped"));
                }
            }
        }

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

        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_RemoveAssignment";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UserId", request.UserId));
        command.Parameters.Add(new SqlParameter("@ModuleId", request.ModuleId));

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var removed = reader.GetInt32(reader.GetOrdinal("Removed"));
            if (removed > 0)
                return Ok(ApiResponse.Ok("Assignment removed successfully."));
        }

        return NotFound(ApiResponse.Fail("Assignment not found."));
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }

    private static bool HasColumn(IDataRecord reader, string columnName)
    {
        for (int i = 0; i < reader.FieldCount; i++)
        {
            if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                return true;
        }
        return false;
    }
}
