using course3_s1_lab1_web.DTOs;
using course3_s1_lab1_web.Interfaces;
using course3_s1_lab1_web.Models;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace course3_s1_lab1_web.Services;

public class CarService : ICarService
{
    private readonly ICarRepository _carRepo;
    private readonly IFactoryRepository _factoryRepo; 
    
    private readonly CarCatalogSettings _settings;
    private readonly ILogger<CarService> _logger;
    public CarService(
        ICarRepository carRepo, 
        IFactoryRepository factoryRepo, 
        IOptions<CarCatalogSettings> options, 
        ILogger<CarService> logger)
    {
        _carRepo = carRepo;
        _factoryRepo = factoryRepo;
        _settings = options.Value; 
        _logger = logger;
    }

    public async Task<IEnumerable<CarResponseDto>> GetAllAsync()
    {
        var cars = await _carRepo.GetAllAsync();
        return cars.Select(c => new CarResponseDto { Id = c.Id, ModelName = c.ModelName, FactoryId = c.FactoryId });
    }

    public async Task<CarResponseDto?> GetByIdAsync(int id)
    {
        var car = await _carRepo.GetByIdAsync(id);
        if (car == null) return null;

        return new CarResponseDto { Id = car.Id, ModelName = car.ModelName, FactoryId = car.FactoryId };
    }

    public async Task<IEnumerable<CarResponseDto>?> GetByFactoryIdAsync(int factoryId)
    {
        if (!await _factoryRepo.ExistsAsync(factoryId)) return null; 

        var cars = await _carRepo.GetByFactoryIdAsync(factoryId);
        return cars!.Select(c => new CarResponseDto { Id = c.Id, ModelName = c.ModelName, FactoryId = c.FactoryId });
    }

    public async Task<CarResponseDto?> CreateAsync(CarCreateDto dto)
    {
        if (!await _factoryRepo.ExistsAsync(dto.FactoryId))
        {
            _logger.LogWarning("Спроба створити авто для неіснуючої фабрики з ID {FactoryId}", dto.FactoryId);
            return null; 
        }

        var modelName = dto.ModelName;

        if (!_settings.OfficialModels.Contains(modelName))
        {
            _logger.LogWarning("Модель '{ModelName}' не є офіційним. Додаємо суфікс.", modelName);
            modelName += _settings.UnofficialSuffix;
        }

        var car = new Car { ModelName = modelName, FactoryId = dto.FactoryId };
        await _carRepo.AddAsync(car);
        
        _logger.LogInformation("Успішно створено автомобіль {ModelName} з ID {CarId}", car.ModelName, car.Id);

        return new CarResponseDto { Id = car.Id, ModelName = car.ModelName, FactoryId = car.FactoryId };
    }

    public async Task<bool?> UpdateAsync(int id, CarCreateDto dto)
    {
        var car = await _carRepo.GetByIdAsync(id);
        if (car == null) return false; 

        if (!await _factoryRepo.ExistsAsync(dto.FactoryId))
        {
            _logger.LogWarning("Спроба оновити авто для неіснуючої фабрики з ID {FactoryId}", dto.FactoryId);
            return null; 
        }

        car.ModelName = dto.ModelName;
        car.FactoryId = dto.FactoryId;
        await _carRepo.UpdateAsync(car);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var car = await _carRepo.GetByIdAsync(id);
        if (car == null) return false;

        await _carRepo.DeleteAsync(car);
        _logger.LogInformation("Автомобіль з ID {Id} було успішно видалено", id);
        return true;
    }
}