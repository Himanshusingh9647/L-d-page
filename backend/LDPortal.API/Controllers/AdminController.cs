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
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get admin dashboard KPI stats
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetAdminOverview";
        command.CommandType = CommandType.StoredProcedure;

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var dto = new AdminDashboardDto
            {
                TotalEmployees = reader.GetInt32(reader.GetOrdinal("TotalEmployees")),
                CompliantEmployees = reader.GetInt32(reader.GetOrdinal("CompliantEmployees")),
                ComplianceRate = reader.GetInt32(reader.GetOrdinal("ComplianceRate")),
                PendingTrainings = reader.GetInt32(reader.GetOrdinal("PendingTrainings")),
                OverdueTrainings = reader.GetInt32(reader.GetOrdinal("OverdueTrainings")),
                CompletedToday = reader.GetInt32(reader.GetOrdinal("CompletedToday"))
            };
            return Ok(ApiResponse<AdminDashboardDto>.Ok(dto));
        }

        return StatusCode(500, ApiResponse.Fail("Database error."));
    }

    /// <summary>
    /// Get all employees with compliance overview
    /// </summary>
    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees([FromQuery] string? search = null)
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetEmployees";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@Search", (object?)search ?? DBNull.Value));

        using var reader = await command.ExecuteReaderAsync();
        var result = new List<EmployeeOverviewDto>();

        while (await reader.ReadAsync())
        {
            result.Add(new EmployeeOverviewDto
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                EmployeeCode = reader.GetString(reader.GetOrdinal("EmployeeCode")),
                FullName = reader.GetString(reader.GetOrdinal("FullName")),
                Department = reader.GetString(reader.GetOrdinal("Department")),
                Initials = reader.GetString(reader.GetOrdinal("Initials")),
                TotalAssigned = reader.GetInt32(reader.GetOrdinal("TotalAssigned")),
                Completed = reader.GetInt32(reader.GetOrdinal("Completed")),
                Pending = reader.GetInt32(reader.GetOrdinal("Pending")),
                Overdue = reader.GetInt32(reader.GetOrdinal("Overdue")),
                VideosCompleted = reader.GetInt32(reader.GetOrdinal("VideosCompleted")),
                TotalVideos = reader.GetInt32(reader.GetOrdinal("TotalVideos")),
                PdfsCompleted = reader.GetInt32(reader.GetOrdinal("PdfsCompleted")),
                TotalPdfs = reader.GetInt32(reader.GetOrdinal("TotalPdfs")),
                IsCompliant = reader.GetBoolean(reader.GetOrdinal("IsCompliant"))
            });
        }

        return Ok(ApiResponse<List<EmployeeOverviewDto>>.Ok(result));
    }

    /// <summary>
    /// Get detailed employee training report with timestamps
    /// </summary>
    [HttpGet("employee/{userId}")]
    public async Task<IActionResult> GetEmployeeDetail(int userId)
    {
        using var connection = _context.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetEmployeeDetail";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UserId", userId));

        using var reader = await command.ExecuteReaderAsync();
        
        UserDto? employee = null;
        if (await reader.ReadAsync())
        {
            employee = new UserDto
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                EmployeeCode = reader.GetString(reader.GetOrdinal("EmployeeCode")),
                FullName = reader.GetString(reader.GetOrdinal("FullName")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Department = reader.GetString(reader.GetOrdinal("Department")),
                Role = reader.GetString(reader.GetOrdinal("Role")),
                Initials = reader.GetString(reader.GetOrdinal("Initials"))
            };
        }

        if (employee == null)
            return NotFound(ApiResponse.Fail("Employee not found."));

        var trainings = new List<ProgressDto>();
        int videosCompleted = 0, totalVideos = 0, pdfsCompleted = 0, totalPdfs = 0;
        bool isCompliant = true;
        bool hasRequired = false;

        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                var type = reader.GetString(reader.GetOrdinal("ModuleType"));
                var status = reader.GetString(reader.GetOrdinal("Status"));
                var isRequired = reader.GetBoolean(reader.GetOrdinal("IsRequired"));
                
                if (type == "Video") { totalVideos++; if (status == "Completed") videosCompleted++; }
                if (type == "PDF") { totalPdfs++; if (status == "Completed") pdfsCompleted++; }
                
                if (isRequired)
                {
                    hasRequired = true;
                    if (status != "Completed") isCompliant = false;
                }

                trainings.Add(new ProgressDto
                {
                    ModuleId = reader.GetInt32(reader.GetOrdinal("ModuleId")),
                    ModuleTitle = reader.GetString(reader.GetOrdinal("ModuleTitle")),
                    ModuleType = type,
                    ModuleDescription = reader.IsDBNull(reader.GetOrdinal("ModuleDescription")) ? null : reader.GetString(reader.GetOrdinal("ModuleDescription")),
                    Duration = reader.IsDBNull(reader.GetOrdinal("Duration")) ? null : reader.GetString(reader.GetOrdinal("Duration")),
                    DurationSeconds = reader.IsDBNull(reader.GetOrdinal("DurationSeconds")) ? null : reader.GetInt32(reader.GetOrdinal("DurationSeconds")),
                    ContentUrl = reader.IsDBNull(reader.GetOrdinal("ContentUrl")) ? null : reader.GetString(reader.GetOrdinal("ContentUrl")),
                    PosterUrl = reader.IsDBNull(reader.GetOrdinal("PosterUrl")) ? null : reader.GetString(reader.GetOrdinal("PosterUrl")),
                    IsRequired = isRequired,
                    DueDate = reader.IsDBNull(reader.GetOrdinal("DueDate")) ? null : reader.GetDateTime(reader.GetOrdinal("DueDate")),
                    Status = status,
                    ResumeTimeSeconds = reader.GetInt32(reader.GetOrdinal("ResumeTimeSeconds")),
                    MaxWatchedSeconds = reader.GetInt32(reader.GetOrdinal("MaxWatchedSeconds")),
                    VideoWatchedPercent = reader.GetDecimal(reader.GetOrdinal("VideoWatchedPercent")),
                    CompletedAt = reader.IsDBNull(reader.GetOrdinal("CompletedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("CompletedAt")),
                    ConsentedAt = reader.IsDBNull(reader.GetOrdinal("ConsentedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("ConsentedAt")),
                    IsRecurring = reader.GetBoolean(reader.GetOrdinal("IsRecurring")),
                    RecurrenceIntervalDays = reader.IsDBNull(reader.GetOrdinal("RecurrenceIntervalDays")) ? null : reader.GetInt32(reader.GetOrdinal("RecurrenceIntervalDays"))
                });
            }
        }

        if (!hasRequired) isCompliant = false;

        var detail = new EmployeeDetailDto
        {
            Employee = employee,
            Trainings = trainings,
            VideosCompleted = videosCompleted,
            TotalVideos = totalVideos,
            PdfsCompleted = pdfsCompleted,
            TotalPdfs = totalPdfs,
            IsCompliant = isCompliant
        };

        return Ok(ApiResponse<EmployeeDetailDto>.Ok(detail));
    }
}
