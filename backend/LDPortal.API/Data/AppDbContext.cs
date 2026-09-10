using Microsoft.EntityFrameworkCore;
using LDPortal.API.Models.Entities;

namespace LDPortal.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TrainingModule> TrainingModules => Set<TrainingModule>();
    public DbSet<TrainingModuleItem> TrainingModuleItems => Set<TrainingModuleItem>();
    public DbSet<TrainingAssignment> TrainingAssignments => Set<TrainingAssignment>();
    public DbSet<TrainingProgress> TrainingProgress => Set<TrainingProgress>();
    public DbSet<TrainingItemProgress> TrainingItemProgress => Set<TrainingItemProgress>();
    public DbSet<RecurringTrainingConfig> RecurringTrainingConfigs => Set<RecurringTrainingConfig>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Users ────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.EmployeeCode).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // ── TrainingModuleItem ───────────────────────────────────────────
        modelBuilder.Entity<TrainingModuleItem>(entity =>
        {
            entity.HasOne(e => e.Module)
                  .WithMany(m => m.Items)
                  .HasForeignKey(e => e.ModuleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── TrainingAssignments ──────────────────────────────────────────
        modelBuilder.Entity<TrainingAssignment>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.ModuleId }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Assignments)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Module)
                  .WithMany(m => m.Assignments)
                  .HasForeignKey(e => e.ModuleId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Assigner)
                  .WithMany()
                  .HasForeignKey(e => e.AssignedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── TrainingProgress ─────────────────────────────────────────────
        modelBuilder.Entity<TrainingProgress>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.ModuleId }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Progress)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Module)
                  .WithMany(m => m.Progress)
                  .HasForeignKey(e => e.ModuleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── TrainingItemProgress ─────────────────────────────────────────
        modelBuilder.Entity<TrainingItemProgress>(entity =>
        {
            entity.HasIndex(e => new { e.ProgressId, e.ItemId }).IsUnique();

            entity.HasOne(e => e.Progress)
                  .WithMany(p => p.ItemProgresses)
                  .HasForeignKey(e => e.ProgressId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Item)
                  .WithMany()
                  .HasForeignKey(e => e.ItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── RecurringTrainingConfig ──────────────────────────────────────
        modelBuilder.Entity<RecurringTrainingConfig>(entity =>
        {
            entity.HasIndex(e => e.ModuleId).IsUnique();

            entity.HasOne(e => e.Module)
                  .WithOne(m => m.RecurringConfig)
                  .HasForeignKey<RecurringTrainingConfig>(e => e.ModuleId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Creator)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

    }
}
