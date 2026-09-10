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
        var employees = await _context.Users
            .Where(u => u.Role == "Employee" && u.IsActive)
            .ToListAsync();

        var totalEmployees = employees.Count;
        var now = DateTime.UtcNow;

        // Get all required assignments with progress
        var requiredAssignments = await (
            from ta in _context.TrainingAssignments
            join u in _context.Users on ta.UserId equals u.UserId
            join tp in _context.TrainingProgress
                on new { ta.UserId, ta.ModuleId } equals new { tp.UserId, tp.ModuleId } into tpGroup
            from tp in tpGroup.DefaultIfEmpty()
            where ta.IsActive && ta.IsRequired && u.IsActive && u.Role == "Employee"
            select new
            {
                ta.UserId,
                ta.ModuleId,
                ta.DueDate,
                Status = tp != null ? tp.Status : "NotStarted",
                CompletedAt = tp != null ? tp.CompletedAt : (DateTime?)null
            }
        ).ToListAsync();

        // Compliant employees — all required assignments completed
        var compliantEmployees = employees.Count(emp =>
        {
            var empAssignments = requiredAssignments.Where(a => a.UserId == emp.UserId);
            return empAssignments.Any() && empAssignments.All(a => a.Status == "Completed");
        });

        // Pending required trainings
        var pendingTrainings = requiredAssignments.Count(a => a.Status != "Completed");

        // Overdue trainings
        var overdueTrainings = requiredAssignments.Count(a =>
            a.Status != "Completed" && a.DueDate.HasValue && a.DueDate.Value < now);

        // Completed today
        var completedToday = requiredAssignments.Count(a =>
            a.Status == "Completed" && a.CompletedAt.HasValue &&
            a.CompletedAt.Value.Date == now.Date);

        var complianceRate = totalEmployees > 0
            ? (compliantEmployees * 100) / totalEmployees
            : 0;

        var dto = new AdminDashboardDto
        {
            TotalEmployees = totalEmployees,
            CompliantEmployees = compliantEmployees,
            ComplianceRate = complianceRate,
            PendingTrainings = pendingTrainings,
            OverdueTrainings = overdueTrainings,
            CompletedToday = completedToday
        };

        return Ok(ApiResponse<AdminDashboardDto>.Ok(dto));
    }

    /// <summary>
    /// Get all employees with compliance overview
    /// </summary>
    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees([FromQuery] string? search = null)
    {
        var employeesQuery = _context.Users
            .Where(u => u.Role == "Employee" && u.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            employeesQuery = employeesQuery.Where(u =>
                u.FullName.ToLower().Contains(searchLower) ||
                u.Department.ToLower().Contains(searchLower) ||
                u.EmployeeCode.ToLower().Contains(searchLower));
        }

        var employees = await employeesQuery.OrderBy(u => u.FullName).ToListAsync();

        var now = DateTime.UtcNow;
        var result = new List<EmployeeOverviewDto>();

        foreach (var emp in employees)
        {
            var assignments = await (
                from ta in _context.TrainingAssignments
                join tm in _context.TrainingModules on ta.ModuleId equals tm.ModuleId
                join tp in _context.TrainingProgress
                    on new { ta.UserId, ta.ModuleId } equals new { tp.UserId, tp.ModuleId } into tpGroup
                from tp in tpGroup.DefaultIfEmpty()
                where ta.UserId == emp.UserId && ta.IsActive && tm.IsActive
                select new
                {
                    ta.IsRequired,
                    tm.Type,
                    ta.DueDate,
                    Status = tp != null ? tp.Status : "NotStarted"
                }
            ).ToListAsync();

            var totalAssigned = assignments.Count;
            var completed = assignments.Count(a => a.Status == "Completed");
            var pending = assignments.Count(a => a.Status != "Completed");
            var overdue = assignments.Count(a => a.Status != "Completed" && a.DueDate.HasValue && a.DueDate.Value < now);

            var videosCompleted = assignments.Count(a => a.Type == "Video" && a.Status == "Completed");
            var totalVideos = assignments.Count(a => a.Type == "Video");
            var pdfsCompleted = assignments.Count(a => a.Type == "PDF" && a.Status == "Completed");
            var totalPdfs = assignments.Count(a => a.Type == "PDF");

            var requiredAssignments = assignments.Where(a => a.IsRequired);
            var isCompliant = requiredAssignments.Any() && requiredAssignments.All(a => a.Status == "Completed");

            result.Add(new EmployeeOverviewDto
            {
                UserId = emp.UserId,
                EmployeeCode = emp.EmployeeCode,
                FullName = emp.FullName,
                Department = emp.Department,
                Initials = emp.Initials,
                TotalAssigned = totalAssigned,
                Completed = completed,
                Pending = pending,
                Overdue = overdue,
                VideosCompleted = videosCompleted,
                TotalVideos = totalVideos,
                PdfsCompleted = pdfsCompleted,
                TotalPdfs = totalPdfs,
                IsCompliant = isCompliant
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
        var employee = await _context.Users.FindAsync(userId);
        if (employee == null || !employee.IsActive)
            return NotFound(ApiResponse.Fail("Employee not found."));

        var trainings = await (
            from ta in _context.TrainingAssignments
            join tm in _context.TrainingModules on ta.ModuleId equals tm.ModuleId
            join tp in _context.TrainingProgress
                on new { ta.UserId, ta.ModuleId } equals new { tp.UserId, tp.ModuleId } into tpGroup
            from tp in tpGroup.DefaultIfEmpty()
            where ta.UserId == userId && ta.IsActive && tm.IsActive
            orderby tp == null || tp.Status != "Completed" ? 0 : 1, ta.DueDate, tm.Title
            select new ProgressDto
            {
                ProgressId = tp != null ? tp.ProgressId : 0,
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

        var videosCompleted = trainings.Count(t => t.ModuleType == "Video" && t.Status == "Completed");
        var totalVideos = trainings.Count(t => t.ModuleType == "Video");
        var pdfsCompleted = trainings.Count(t => t.ModuleType == "PDF" && t.Status == "Completed");
        var totalPdfs = trainings.Count(t => t.ModuleType == "PDF");

        var requiredTrainings = trainings.Where(t => t.IsRequired);
        var isCompliant = requiredTrainings.Any() && requiredTrainings.All(t => t.Status == "Completed");

        var detail = new EmployeeDetailDto
        {
            Employee = new UserDto
            {
                UserId = employee.UserId,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Email = employee.Email,
                Department = employee.Department,
                Role = employee.Role,
                Initials = employee.Initials
            },
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
