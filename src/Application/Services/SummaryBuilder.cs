using System.Text;
using Domain.Entities;

namespace Application.Services
{
    public class SummaryBuilder
    {
        public string BuildSummary(Ticket ticket)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"# {ticket.Title}");
            sb.AppendLine();
            sb.AppendLine($"**Status:** {ticket.Status}");
            sb.AppendLine($"**Created:** {ticket.CreatedAt:yyyy-MM-dd HH:mm} UTC");

            if (ticket.IsBlocking)
                sb.AppendLine("**⚠️ BLOCKING ISSUE**");

            sb.AppendLine();
            sb.AppendLine("## History");
            sb.AppendLine();

            foreach (var action in ticket.Actions.OrderBy(a => a.PerformedAt))
            {
                var timestamp = action.PerformedAt.ToString("yyyy-MM-dd HH:mm");
                var user = action.PerformedBy.DisplayName;

                switch (action.ActionType)
                {
                    case Domain.Enums.ActionType.StatusChange:
                        sb.AppendLine($"- **{timestamp}** [{user}] Status: {action.FromStatus} → {action.ToStatus}");
                        if (!string.IsNullOrWhiteSpace(action.Notes))
                            sb.AppendLine($"  - {action.Notes}");
                        break;
                    case Domain.Enums.ActionType.Create:
                        sb.AppendLine($"- **{timestamp}** [{user}] Yeni bir ariza olusturuldu.");
                        break;
                }
            }

            if (ticket.Comments.Any())
            {
                sb.AppendLine();
                sb.AppendLine("## Comments");
                foreach (var comment in ticket.Comments.OrderBy(c => c.CreatedAt).Take(10))
                {
                    sb.AppendLine($"- **{comment.CreatedAt:yyyy-MM-dd HH:mm}** [{comment.CreatedBy.DisplayName}]");
                    sb.AppendLine($"  {comment.Body}");
                }
            }

            return sb.ToString();
        }
    }
}