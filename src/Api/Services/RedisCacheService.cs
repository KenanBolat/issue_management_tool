using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;

namespace Api.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<RedisCacheService> _logger;


        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public RedisCacheService(IDistributedCache cache, IConnectionMultiplexer redis, ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _redis = redis;
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var cached = await _cache.GetStringAsync(key);
                if (cached == null) return default;

                return JsonSerializer.Deserialize<T>(cached, _jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache for key {CacheKey}", key);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpire = null)
        {
            try
            {
                var data = JsonSerializer.Serialize(value, _jsonOptions);
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = absoluteExpire ?? TimeSpan.FromMinutes(30)
                };
                await _cache.SetStringAsync(key, data, options);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache for key {CacheKey}", key);
            }
        }

        public Task RemoveAsync(string key)
        {
            try
            {

                return _cache.RemoveAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache for key {CacheKey}", key);
                return Task.CompletedTask;
            }
        }

        public async Task RemoveByPatternAsync(string pattern)
        {
            try
            {
                var db = _redis.GetDatabase();
                var endpoints = _redis.GetEndPoints();
                var server = _redis.GetServer(endpoints.First());

                var fullPattern = $"tickettracker:{pattern}";
                var keys = server.Keys(pattern: fullPattern).ToArray();

                if (keys.Length == 0)
                {
                    _logger.LogDebug($"No Keys found matching pattern: {pattern}");
                    return;

                }
                await db.KeyDeleteAsync(keys);
                _logger.LogInformation($"Deleted {keys.Length} keys matching pattern : {pattern}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing keys by pattern: {pattern}");
            }
        }

        public async Task RemoveMultipleAsync(params string[] keys)
        {
            try
            {
                var tasks = keys.Select(key => RemoveAsync(key));
                await Task.WhenAll(tasks);
                _logger.LogInformation($"Removed {keys.Length} keys from cache.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing multiple cache keys.");
            }
        }

        public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
        {
            var cached = await GetAsync<T>(key);

            if (cached != null)
            {
                _logger.LogDebug($"Cache HIT: {key}");
                return cached;
            }

            _logger.LogDebug($"Cache MISS: {key}");

            var value = await factory();
            await SetAsync(key, value, expiry);

            return value;
        }
    }
}
