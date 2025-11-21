using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public record StatusDurationSegment(TicketStatus Status, TimeSpan Duration);

    public static class TicketStatusDurationHelper
    {
        /// <summary>
        /// Calculates chronological status segments for a ticket
        /// using Create + StatusChange actions.
        /// 
        /// - Ignores Edit / Comment / Attachment actions.
        /// - If there is no StatusChange at all, returns empty list.
        /// - Final segment is calculated up to endAt (or ResponseResolvedAt /
        ///   ResolutionDate / UpdatedAt fallback).
        /// </summary>
        public static List<StatusDurationSegment> CalculateTimeline(Ticket ticket, DateTime? endAt = null)
        {
            // Use a reasonable default end time for the last status
            var effectiveEnd = endAt
                               ?? ticket.ResponseResolvedAt
                               ?? ticket.ResolutionDate
                               ?? ticket.UpdatedAt;

            // Only Create + StatusChange actions matter for the status timeline
            var events = ticket.Actions
                .Where(a => a.ActionType == ActionType.Create ||
                            a.ActionType == ActionType.StatusChange)
                .Where(a => a.ToStatus.HasValue)            // safety
                .OrderBy(a => a.PerformedAt)
                .ToList();

            // If there is no StatusChange at all, do not calculate anything
            if (!events.Any(e => e.ActionType == ActionType.StatusChange) ||
                events.Count < 2)
            {
                return new List<StatusDurationSegment>();
            }

            var segments = new List<StatusDurationSegment>();

            // Sliding window: [current, next)
            for (int i = 0; i < events.Count - 1; i++)
            {
                var current = events[i];
                var next = events[i + 1];

                var status = current.ToStatus!.Value;
                var duration = next.PerformedAt - current.PerformedAt;

                if (duration <= TimeSpan.Zero)
                    continue; // guard against clock issues / bad data

                segments.Add(new StatusDurationSegment(status, duration));
            }

            // Last segment: from last status-change to end
            var last = events[^1];
            if (effectiveEnd > last.PerformedAt && last.ToStatus.HasValue)
            {
                var duration = effectiveEnd - last.PerformedAt;
                if (duration > TimeSpan.Zero)
                {
                    segments.Add(new StatusDurationSegment(last.ToStatus.Value, duration));
                }
            }

            return segments;
        }

        /// <summary>
        /// Human-readable duration, e.g. "5 gün", "4 saat", "15 dakika".
        /// </summary>
        public static string FormatDuration(TimeSpan duration)
        {
            if (duration.TotalDays >= 1)
                return $"{(int)duration.TotalDays} gün";

            if (duration.TotalHours >= 1)
                return $"{(int)duration.TotalHours} saat";

            var minutes = (int)Math.Max(1, Math.Round(duration.TotalMinutes));
            return $"{minutes} dakika";
        }

        /// <summary>
        /// Formats a full timeline string like:
        /// "PAUSED 15 dakika -> REOPENED 4 gün -> PAUSED 5 gün -> CLOSED 1 gün"
        /// </summary>
        public static string FormatTimeline(IEnumerable<StatusDurationSegment> segments)
        {
            return string.Join(" -> ",
                segments.Select(s => $"{s.Status} {FormatDuration(s.Duration)}"));
        }
    }
}
