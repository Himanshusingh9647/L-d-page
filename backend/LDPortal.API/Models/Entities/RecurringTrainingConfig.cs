using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LDPortal.API.Models.Entities;

[Table("RecurringTrainingConfig")]
public class RecurringTrainingConfig
{
    [Key]
    public int ConfigId { get; set; }

    public int ModuleId { get; set; }

    public int RecurrenceIntervalDays { get; set; } = 90;

    public bool IsActive { get; set; } = true;

    public int? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey("ModuleId")]
    public TrainingModule Module { get; set; } = null!;

    [ForeignKey("CreatedBy")]
    public User? Creator { get; set; }
}
