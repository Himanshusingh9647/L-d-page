using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LDPortal.API.Models.Entities;

[Table("TrainingModuleItems")]
public class TrainingModuleItem
{
    [Key]
    public int ItemId { get; set; }

    public int ModuleId { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string ContentUrl { get; set; } = string.Empty;

    public int OrderIndex { get; set; } = 0;

    public int? DurationSeconds { get; set; }

    // Navigation
    [ForeignKey("ModuleId")]
    [JsonIgnore]
    public TrainingModule Module { get; set; } = null!;
}
