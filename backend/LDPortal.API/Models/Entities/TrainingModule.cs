using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LDPortal.API.Models.Entities;

[Table("TrainingModules")]
public class TrainingModule
{
    [Key]
    public int ModuleId { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Type { get; set; } = "Video"; // Video or PDF

    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Duration { get; set; }

    public int? DurationSeconds { get; set; }

    [MaxLength(1000)]
    public string? ContentUrl { get; set; }

    [MaxLength(1000)]
    public string? PosterUrl { get; set; }

    public string? PolicyContent { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<TrainingModuleItem> Items { get; set; } = new List<TrainingModuleItem>();
    public ICollection<TrainingAssignment> Assignments { get; set; } = new List<TrainingAssignment>();
    public ICollection<TrainingProgress> Progress { get; set; } = new List<TrainingProgress>();
    public RecurringTrainingConfig? RecurringConfig { get; set; }
}
