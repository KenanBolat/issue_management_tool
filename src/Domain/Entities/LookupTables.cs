using Domain.Entities;
using Domain.Enums;


namespace Domain.Entities
{
    public class ConfigurationItem
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class Component
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public long? SubsystemId { get; set; }
        public Subsystem? Subsystem { get; set; }
    }

    public class Subsystem
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public long? SystemId { get; set; }
        public SystemEntity? System { get; set; }
    }

    public class SystemEntity
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
    }
}