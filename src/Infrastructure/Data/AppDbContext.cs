using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<TicketAction> TicketActions { get; set; }
        public DbSet<TicketComment> TicketComments { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<ConfigurationItem> ConfigurationItems { get; set; }
        public DbSet<Component> Components { get; set; }
        public DbSet<Subsystem> Subsystems { get; set; }
        public DbSet<SystemEntity> Systems { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<CIJob> CIJobs { get; set; }
        public DbSet<TicketResponsePersonnel> TicketResponsePersonnel { get; set; }
        public DbSet<TicketResponseResolvedPersonnel> TicketResponseResolvedPersonnel { get; set; }
        public DbSet<MilitaryRank> MilitaryRanks { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<Configuration> Configurations { get; set; }

        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationRead> NotificationReads { get; set; }
        public DbSet<NotificationAction> NotificationActions { get; set; }
        public DbSet<ProgressRequest> ProgressRequests { get; set; }
        public DbSet<ProgressRequestUpdate> progressRequestUpdates { set; get; }
        public DbSet<TicketPause> TicketPauses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
                entity.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Role).IsRequired();

                entity
                    .HasOne(e => e.MilitaryRank)
                    .WithMany()
                    .HasForeignKey(e => e.MilitaryRankId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity
                    .HasOne(e => e.CreatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.LastUpdatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.LastUpdatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.PreferredLanguage).HasMaxLength(10);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.RankCode).HasMaxLength(100);

                // CRITICAL: Map the User collections to Ticket explicitly
                entity
                    .HasMany(u => u.CreatedTickets)
                    .WithOne(t => t.CreatedBy)
                    .HasForeignKey(t => t.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasMany(u => u.UpdatedTickets)
                    .WithOne(t => t.LastUpdatedBy)
                    .HasForeignKey(t => t.LastUpdatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.HasPostgresEnum<NotificationMethod>();
            modelBuilder.HasPostgresEnum<ActivityCheckResult>();

            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.ToTable("ticket");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ExternalCode).IsUnique();
                entity.Property(e => e.ExternalCode).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
                entity.Property(e => e.ConfirmationStatus).HasConversion<string>().HasMaxLength(50);

                // User relationships - mapped from User side, but can be reinforced here
                entity
                    .HasOne(e => e.CreatedBy)
                    .WithMany(u => u.CreatedTickets)
                    .HasForeignKey(e => e.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();

                entity
                    .HasOne(t => t.ActivityControlPersonnel)
                    .WithMany()
                    .HasForeignKey(t => t.ActivityControlPersonnelId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(t => t.ActivityControlCommander)
                    .WithMany()
                    .HasForeignKey(t => t.ActivityControlCommanderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.LastUpdatedBy)
                    .WithMany(u => u.UpdatedTickets)
                    .HasForeignKey(e => e.LastUpdatedById)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity
                    .HasOne(t => t.DetectedByUser)
                    .WithMany()
                    .HasForeignKey(t => t.DetectedByUserId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("fk_ticket_detection_detected_by_user")
                    .IsRequired(false);

                // Configure other navigation properties
                entity
                    .HasOne(t => t.CI)
                    .WithMany()
                    .HasForeignKey(t => t.CIId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity
                    .HasOne(t => t.Component)
                    .WithMany()
                    .HasForeignKey(t => t.ComponentId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity
                    .HasOne(t => t.Subsystem)
                    .WithMany()
                    .HasForeignKey(t => t.SubsystemId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity
                    .HasOne(t => t.System)
                    .WithMany()
                    .HasForeignKey(t => t.SystemId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                // Many-to-many relationship
                entity
                    .HasMany(t => t.ResponseByUser)
                    .WithOne(trp => trp.Ticket)
                    .HasForeignKey(trp => trp.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Many-to-many relationship
                entity
                    .HasMany(t => t.ResponseResolvedByUser)
                    .WithOne(trp => trp.Ticket)
                    .HasForeignKey(trp => trp.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<TicketResponsePersonnel>(entity =>
            {
                entity.ToTable("ticket_response_personnel");
                entity.HasKey(x => new { x.TicketId, x.UserId });

                entity
                    .HasOne(x => x.Ticket)
                    .WithMany(t => t.ResponseByUser)
                    .HasForeignKey(x => x.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TicketResponseResolvedPersonnel>(entity =>
            {
                entity.ToTable("ticket_response_resolved_personnel");
                entity.HasKey(x => new { x.TicketId, x.UserId });

                entity
                    .HasOne(x => x.Ticket)
                    .WithMany(t => t.ResponseResolvedByUser)
                    .HasForeignKey(x => x.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TicketAction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActionType).HasConversion<string>().HasMaxLength(50);
                entity.Property(e => e.FromStatus).HasConversion<string>().HasMaxLength(50);
                entity.Property(e => e.ToStatus).HasConversion<string>().HasMaxLength(50);

                entity
                    .HasOne(e => e.Ticket)
                    .WithMany(t => t.Actions)
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.PerformedBy)
                    .WithMany(u => u.TicketActions)
                    .HasForeignKey(e => e.PerformedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketComment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity
                    .HasOne(e => e.Ticket)
                    .WithMany(t => t.Comments)
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CIJob>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);

                entity
                    .HasOne(e => e.Ticket)
                    .WithMany(t => t.CIJobs)
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PermissionType).IsRequired();

                entity
                    .HasOne(e => e.User)
                    .WithMany(u => u.UserPermissions)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.GrantedBy)
                    .WithMany()
                    .HasForeignKey(e => e.GrantedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.UserId, e.PermissionType });
            });

            modelBuilder.Entity<MilitaryRank>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(100);
                entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasIndex(e => e.Code).IsUnique();
            });
            modelBuilder.Entity<Configuration>(entity =>
            {
                entity.ToTable("configuration");
                entity.HasKey(e => e.Id);
                entity
                    .HasOne(e => e.UpdatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.UpdatedById)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);

                entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);

                entity
                    .HasOne(e => e.Ticket)
                    .WithMany()
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.CreatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.TargetUser)
                    .WithMany()
                    .HasForeignKey(e => e.TargetUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.ResolvedBy)
                    .WithMany()
                    .HasForeignKey(e => e.ResolvedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.TicketId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => new { e.Type, e.IsResolved });
            });

            // NotificationRead configuration
            modelBuilder.Entity<NotificationRead>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity
                    .HasOne(e => e.Notification)
                    .WithMany(n => n.NotificationReads)
                    .HasForeignKey(e => e.NotificationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.NotificationId, e.UserId }).IsUnique();
            });

            // NotificationAction configuration
            modelBuilder.Entity<NotificationAction>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.ActionType).IsRequired().HasMaxLength(50);

                entity
                    .HasOne(e => e.Notification)
                    .WithMany(n => n.NotificationActions)
                    .HasForeignKey(e => e.NotificationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            //ProgressRequest configuration

            modelBuilder.Entity<ProgressRequest>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);

                entity
                    .HasOne(e => e.Ticket)
                    .WithMany()
                    .HasForeignKey(e => e.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(e => e.RequestedBy)
                    .WithMany()
                    .HasForeignKey(e => e.RequestedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.TargetUser)
                    .WithMany()
                    .HasForeignKey(e => e.TargetUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(e => e.RespondedBy)
                    .WithMany()
                    .HasForeignKey(e => e.RespondedByUserId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity
                    .HasOne(e => e.ResponseAction)
                    .WithMany()
                    .HasForeignKey(e => e.ResponseActionId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .IsRequired(false);

                entity
                    .HasOne(e => e.Notification)
                    .WithMany()
                    .HasForeignKey(e => e.NotificationId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.TicketId);
                entity.HasIndex(e => e.TargetUserId);
                entity.HasIndex(e => e.Status);
            });

            modelBuilder.Entity<TicketPause>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.PauseReason).IsRequired().HasMaxLength(1000);

                entity.Property(e => e.ResumeNotes).HasMaxLength(1000);

                entity
                    .HasOne(tp => tp.Ticket)
                    .WithMany(t => t.Pauses)
                    .HasForeignKey(tp => tp.TicketId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity
                    .HasOne(tp => tp.PausedByUser)
                    .WithMany()
                    .HasForeignKey(tp => tp.PausedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity
                    .HasOne(tp => tp.ResumedByUser)
                    .WithMany()
                    .HasForeignKey(tp => tp.ResumedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indexes for performance
                entity.HasIndex(tp => tp.TicketId);
                entity.HasIndex(tp => tp.PausedAt);
                entity.HasIndex(tp => new { tp.TicketId, tp.ResumedAt });
            });
        }
    }
}
