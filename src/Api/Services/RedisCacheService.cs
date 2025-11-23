using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace Api.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public RedisCacheService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            var cached = await _cache.GetStringAsync(key);
            if (cached == null) return default;

            return JsonSerializer.Deserialize<T>(cached, _jsonOptions);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpire = null)
        {
            var data = JsonSerializer.Serialize(value, _jsonOptions);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpire ?? TimeSpan.FromMinutes(30)
            };
            await _cache.SetStringAsync(key, data, options);
        }

        public Task RemoveAsync(string key)
        {
            return _cache.RemoveAsync(key);
        }
    }
}
