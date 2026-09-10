using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LDPortal.API.Models.Entities;

[Table("TrainingAssignments")]
public class TrainingAssignment
{
    [Key]
    public int AssignmentId { get; set; }

    public int UserId { get; set; }

    public int ModuleId { get; set; }

    public bool IsRequired { get; set; } = true;

    public DateTime? DueDate { get; set; }

    public int? AssignedBy { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public bool IsRecurring { get; set; } = false;

    public int? RecurrenceIntervalDays { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("ModuleId")]
    public TrainingModule Module { get; set; } = null!;

    [ForeignKey("AssignedBy")]
    public User? Assigner { get; set; }
}
