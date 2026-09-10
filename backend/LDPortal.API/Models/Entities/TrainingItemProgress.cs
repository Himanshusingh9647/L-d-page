using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LDPortal.API.Models.Entities;

[Table("TrainingItemProgress")]
public class TrainingItemProgress
{
    [Key]
    public int ItemProgressId { get; set; }

    public int ProgressId { get; set; }

    public int ItemId { get; set; }

    public int ResumeTimeSeconds { get; set; } = 0;

    public int MaxWatchedSeconds { get; set; } = 0;

    public bool IsCompleted { get; set; } = false;

    // Navigation
    [ForeignKey("ProgressId")]
    [JsonIgnore]
    public TrainingProgress Progress { get; set; } = null!;

    [ForeignKey("ItemId")]
    [JsonIgnore]
    public TrainingModuleItem Item { get; set; } = null!;
}
