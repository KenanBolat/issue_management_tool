namespace Api.Services
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpire = null);
        Task RemoveAsync(string key);

        Task RemoveByPatternAsync(string pattern);
        Task RemoveMultipleAsync(params string[] keys);
        Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null);

    }
}
