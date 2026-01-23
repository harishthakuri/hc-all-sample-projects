using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace MOQCoreAPI.Services
{
    public class InMemoryCacheService:ICacheService
    {

        private readonly IMemoryCache _cache;

        public InMemoryCacheService(IMemoryCache memoryCache)
        {
            _cache = memoryCache;
        }



        public Task<string> GetCacheValueAsync(string key)
        {
            return Task.FromResult(_cache.Get<string>(key));
        }


        public Task SetCacheValueAsync(string key, string value)
        {
            var option = new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromSeconds(10),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
            };

            _cache.Set(key, value,option);
            return Task.CompletedTask;
        }




    }
}
