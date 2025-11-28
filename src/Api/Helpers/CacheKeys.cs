namespace Api.Helpers
{
    public static class CacheKeys
    {
        public static class Tickets
        {
            public static string Detail(long ticketId) => $"ticket:detail:{ticketId}";
            public static string List() => "ticket:list:*";
            public static string All() => "ticket:*";
        }

        public static class TicketPauses
        {
            public static string Detail(long pauseId) => $"pause:detail:{pauseId}";
            public static string ByTicket(long ticketId) => $"pause:ticket:{ticketId}";
            public static string List() => "pause:list:*";
            public static string All() => "pause:*";
        }
    }
}