using Microsoft.AspNetCore.Identity;
using Domain.Entities;
using Domain.Enums;
using System.Threading.Tasks;
using Infrastructure.Data;

namespace Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {

            if (context.Users.Any())
            {
                return; // DB has been seeded
            }

            var hasher = new PasswordHasher<User>();
            var admin = new User
            {
                Email = "admin@example.com",
                DisplayName = "Administrator",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };

            admin.PasswordHash = hasher.HashPassword(admin, "adminpasswd");

            var editor = new User
            {
                Email = "editor@example.com",
                DisplayName = "Editor User",
                Role = UserRole.Editor,
                CreatedAt = DateTime.UtcNow
            };
            editor.PasswordHash = hasher.HashPassword(editor, "editorpasswd");


            var viewer = new User
            {
                Email = "viewer@example.com",
                DisplayName = "Viewer User",
                Role = UserRole.Viewer,
                CreatedAt = DateTime.UtcNow
            };
            viewer.PasswordHash = hasher.HashPassword(viewer, "viewerpasswd");

            context.Users.AddRange(admin, editor, viewer);
            await context.SaveChangesAsync();


            var system1 = new SystemEntity { Name = "GGS" };
            var subsystem1 = new Subsystem { Name = "Payload", System = system1 };
            var component1 = new Component { Name = "Yazılım", Subsystem = subsystem1 };
            var ci1 = new ConfigurationItem { Name = "SPC" };
            context.Systems.Add(system1);
            context.Subsystems.Add(subsystem1);
            context.Components.Add(component1);
            context.ConfigurationItems.Add(ci1);
            await context.SaveChangesAsync();

            var ticket1 = new Ticket
            {
                ExternalCode = "T003198",
                Title = "Sample Ticket 1",
                Description = "This is a sample ticket.",
                IsBlocking = false,
                Status = TicketStatus.OPEN,
                CreatedAt = DateTime.UtcNow,
                CreatedById = admin.Id,
                CIId = ci1.Id,
                SystemId = system1.Id,
                SubsystemId = subsystem1.Id,
                ComponentId = component1.Id
            };   
            
            context.Tickets.Add(ticket1);
            await context.SaveChangesAsync();

            context.TicketActions.Add(new TicketAction
            {
                TicketId = ticket1.Id,
                ActionType = ActionType.Create,
                FromStatus = null,
                ToStatus = TicketStatus.OPEN,
                PerformedById = editor.Id,
                PerformedAt = ticket1.CreatedAt
            }); 

            await context.SaveChangesAsync();

        }

    }
}