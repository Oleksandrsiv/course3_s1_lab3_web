using course3_s1_lab1_web.DTOs;
using course3_s1_lab1_web.Interfaces;
using course3_s1_lab1_web.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace course3_s1_lab1_web.Services;

public class FactoryService : IFactoryService
{
    private readonly IFactoryRepository _repository;
    private readonly IMemoryCache _cache;
    private readonly ILogger<FactoryService> _logger;

    public FactoryService(
        IFactoryRepository repository, 
        IMemoryCache cache, 
        ILogger<FactoryService> logger)
    {
        _repository = repository;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<FactoryResponseDto>> GetAllAsync()
    {
        string cacheKey = "all_factories";

        if (_cache.TryGetValue(cacheKey, out IEnumerable<FactoryResponseDto>? cachedFactories))
        {
            _logger.LogInformation("Список фабрик отримано з кешу.");
            return cachedFactories!;
        }

        _logger.LogInformation("Кеш порожній. Виконується запит до бази даних для отримання фабрик.");
        
        var factories = await _repository.GetAllAsync();
        var dtos = factories.Select(f => new FactoryResponseDto { Id = f.Id, Name = f.Name }).ToList();

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(1));
            
        _cache.Set(cacheKey, dtos, cacheOptions);

        return dtos;
    }

    public async Task<FactoryResponseDto?> GetByIdAsync(int id)
    {
        var factory = await _repository.GetByIdAsync(id);
        if (factory == null) return null;
        
        return new FactoryResponseDto { Id = factory.Id, Name = factory.Name };
    }

    public async Task<FactoryResponseDto> CreateAsync(FactoryCreateDto dto)
    {
        var factory = new Factory { Name = dto.Name };
        await _repository.AddAsync(factory); 
        
        return new FactoryResponseDto { Id = factory.Id, Name = factory.Name };
    }

    public async Task<bool> UpdateAsync(int id, FactoryCreateDto dto)
    {
        var factory = await _repository.GetByIdAsync(id);
        if (factory == null) return false;

        factory.Name = dto.Name;
        await _repository.UpdateAsync(factory);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var factory = await _repository.GetByIdAsync(id);
        if (factory == null) return false;

        await _repository.DeleteAsync(factory);
        return true;
    }
}