using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Domain.Enums;

namespace Infrastructure.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)  { }

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
            });

            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ExternalCode).IsUnique();
                entity.Property(e => e.ExternalCode).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
                entity.Property(e => e.ConfirmationStatus).HasConversion<string>().HasMaxLength(50);

                entity.HasOne(e => e.CreatedBy)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedById)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.LastUpdatedBy)
                      .WithMany()
                      .HasForeignKey(e => e.LastUpdatedById)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasQueryFilter(e => !e.IsDeleted);


            });

            modelBuilder.Entity<TicketAction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActionType).HasConversion<string>().HasMaxLength(50);
                entity.Property(e => e.FromStatus).HasConversion<string>().HasMaxLength(50);
                entity.Property(e => e.ToStatus).HasConversion<string>().HasMaxLength(50);


                entity.HasOne(e => e.Ticket)
                      .WithMany(t => t.Actions)
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.PerformedBy)
                      .WithMany()
                      .HasForeignKey(e => e.PerformedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketComment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Ticket)
                      .WithMany(t => t.Comments)
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);


            });
            
            modelBuilder.Entity<CIJob>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);

                entity.HasOne(e => e.Ticket)
                      .WithMany(t => t.CIJobs)
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

    }
}