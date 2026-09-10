using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LDPortal.API.Models.Entities;

[Table("TrainingProgress")]
public class TrainingProgress
{
    [Key]
    public int ProgressId { get; set; }

    public int UserId { get; set; }

    public int ModuleId { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Completed

    public int ResumeTimeSeconds { get; set; } = 0;

    public int MaxWatchedSeconds { get; set; } = 0;

    [Column(TypeName = "decimal(5,2)")]
    public decimal VideoWatchedPercent { get; set; } = 0;

    public DateTime? CompletedAt { get; set; }

    public DateTime? ConsentedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("ModuleId")]
    public TrainingModule Module { get; set; } = null!;

    public ICollection<TrainingItemProgress> ItemProgresses { get; set; } = new List<TrainingItemProgress>();
}
