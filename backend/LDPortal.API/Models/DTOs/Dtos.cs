using System.ComponentModel.DataAnnotations;

namespace LDPortal.API.Models.DTOs;

// ── Auth DTOs ────────────────────────────────────────────────────────────────

public class LoginRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int UserId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
}

// ── Module DTOs ──────────────────────────────────────────────────────────────

public class ModuleItemDto
{
    public int ItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentUrl { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public int? DurationSeconds { get; set; }
}

public class ModuleDto
{
    public int ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Duration { get; set; }
    public int? DurationSeconds { get; set; }
    public string? ContentUrl { get; set; } // Deprecated, kept for backwards compatibility
    public string? PosterUrl { get; set; }
    public string? PolicyContent { get; set; }
    public bool IsActive { get; set; }
    public List<ModuleItemDto> Items { get; set; } = new();
}

public class CreateModuleItemRequest
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;
    [Required, MaxLength(1000)]
    public string ContentUrl { get; set; } = string.Empty;
    public int? DurationSeconds { get; set; }
}

public class CreateModuleRequest
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "Video";

    public string? Description { get; set; }
    public string? Duration { get; set; }
    public int? DurationSeconds { get; set; }
    public string? ContentUrl { get; set; } // Deprecated
    public string? PosterUrl { get; set; }
    public string? PolicyContent { get; set; }
    public List<CreateModuleItemRequest> Items { get; set; } = new();
}

public class UpdateModuleRequest
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? Duration { get; set; }
    public int? DurationSeconds { get; set; }
    public string? ContentUrl { get; set; } // Deprecated
    public string? PosterUrl { get; set; }
    public string? PolicyContent { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateModuleItemRequest> Items { get; set; } = new();
}

// ── Assignment DTOs ──────────────────────────────────────────────────────────

public class AssignmentDto
{
    public int AssignmentId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int ModuleId { get; set; }
    public string ModuleTitle { get; set; } = string.Empty;
    public string ModuleType { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurrenceIntervalDays { get; set; }
    public DateTime AssignedAt { get; set; }
}

public class CreateAssignmentRequest
{
    [Required]
    public List<int> UserIds { get; set; } = new();

    [Required]
    public List<int> ModuleIds { get; set; } = new();

    public bool IsRequired { get; set; } = true;

    public DateTime? DueDate { get; set; }
}

public class RemoveAssignmentRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int ModuleId { get; set; }
}

// ── Progress DTOs ────────────────────────────────────────────────────────────

public class ProgressDto
{
    public int ProgressId { get; set; }
    public int ModuleId { get; set; }
    public string ModuleTitle { get; set; } = string.Empty;
    public string ModuleType { get; set; } = string.Empty;
    public string? ModuleDescription { get; set; }
    public string? Duration { get; set; }
    public int? DurationSeconds { get; set; }
    public string? ContentUrl { get; set; }
    public string? PosterUrl { get; set; }
    public string? PolicyContent { get; set; }
    public bool IsRequired { get; set; }
    public DateTime? DueDate { get; set; }
    public string Status { get; set; } = "NotStarted";
    public int ResumeTimeSeconds { get; set; }
    public int MaxWatchedSeconds { get; set; }
    public decimal VideoWatchedPercent { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ConsentedAt { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurrenceIntervalDays { get; set; }
    public List<int> CompletedItemIds { get; set; } = new();
    public List<ItemProgressDto> ItemProgresses { get; set; } = new();
}

public class ItemProgressDto
{
    public int ItemId { get; set; }
    public int ResumeTimeSeconds { get; set; }
    public int MaxWatchedSeconds { get; set; }
    public bool IsCompleted { get; set; }
}

public class UpdateVideoTimeRequest
{
    [Required]
    public int ModuleId { get; set; }

    [Required]
    public int ItemId { get; set; }

    [Range(0, int.MaxValue)]
    public int ResumeTimeSeconds { get; set; }

    [Range(0, int.MaxValue)]
    public int MaxWatchedSeconds { get; set; }

    [Range(0, 100)]
    public decimal VideoWatchedPercent { get; set; }
}

public class CompleteVideoRequest
{
    [Required]
    public int ModuleId { get; set; }

    [Required]
    public int ItemId { get; set; }
}

public class ConsentPdfRequest
{
    [Required]
    public int ModuleId { get; set; }
}

// ── Admin Dashboard DTOs ────────────────────────────────────────────────────

public class AdminDashboardDto
{
    public int TotalEmployees { get; set; }
    public int CompliantEmployees { get; set; }
    public int ComplianceRate { get; set; }
    public int PendingTrainings { get; set; }
    public int OverdueTrainings { get; set; }
    public int CompletedToday { get; set; }
}

public class EmployeeOverviewDto
{
    public int UserId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public int TotalAssigned { get; set; }
    public int Completed { get; set; }
    public int Pending { get; set; }
    public int Overdue { get; set; }
    public int VideosCompleted { get; set; }
    public int TotalVideos { get; set; }
    public int PdfsCompleted { get; set; }
    public int TotalPdfs { get; set; }
    public bool IsCompliant { get; set; }
}

public class EmployeeDetailDto
{
    public UserDto Employee { get; set; } = null!;
    public List<ProgressDto> Trainings { get; set; } = new();
    public int VideosCompleted { get; set; }
    public int TotalVideos { get; set; }
    public int PdfsCompleted { get; set; }
    public int TotalPdfs { get; set; }
    public bool IsCompliant { get; set; }
}

// ── Training Matrix DTOs ────────────────────────────────────────────────────

public class TrainingMatrixDto
{
    public List<UserDto> Employees { get; set; } = new();
    public List<ModuleDto> Modules { get; set; } = new();
    public List<MatrixCellDto> Assignments { get; set; } = new();
}

public class MatrixCellDto
{
    public int UserId { get; set; }
    public int ModuleId { get; set; }
    public bool IsAssigned { get; set; }
    public bool IsRequired { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Status { get; set; }
}

// ── Recurring Training DTOs ─────────────────────────────────────────────────

public class RecurringConfigDto
{
    public int ConfigId { get; set; }
    public int ModuleId { get; set; }
    public string ModuleTitle { get; set; } = string.Empty;
    public string ModuleType { get; set; } = string.Empty;
    public int RecurrenceIntervalDays { get; set; }
    public bool IsActive { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRecurringConfigRequest
{
    [Required]
    public int ModuleId { get; set; }

    [Required, Range(1, 3650)]
    public int RecurrenceIntervalDays { get; set; } = 90;
}

public class UpdateRecurringConfigRequest
{
    [Range(1, 3650)]
    public int RecurrenceIntervalDays { get; set; }

    public bool IsActive { get; set; }
}

// ── Common Response DTOs ────────────────────────────────────────────────────

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success") => new()
    {
        Success = true,
        Message = message,
        Data = data
    };

    public static ApiResponse<T> Fail(string message) => new()
    {
        Success = false,
        Message = message
    };
}

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;

    public static ApiResponse Ok(string message = "Success") => new()
    {
        Success = true,
        Message = message
    };

    public static ApiResponse Fail(string message) => new()
    {
        Success = false,
        Message = message
    };
}
