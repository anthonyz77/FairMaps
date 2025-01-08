package com.spring;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class CacheHandler {
    @Autowired
    private CacheManager cacheManager;

    public Map<String, Object> getFromCache(String cacheKey, String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            Cache.ValueWrapper cachedValue = cache.get(cacheKey);
            if (cachedValue != null) {
                return (Map<String, Object>)cachedValue.get();
            }
        }
        return null;
    }

    public void putToCache(String cacheKey, Map<String, Object> data, String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.put(cacheKey, data);
        }
    }
}
