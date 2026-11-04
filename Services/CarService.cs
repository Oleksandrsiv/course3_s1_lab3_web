using course3_s1_lab1_web.DTOs;
using course3_s1_lab1_web.Interfaces;
using course3_s1_lab1_web.Models;

namespace course3_s1_lab1_web.Services;

public class CarService : ICarService
{
    private readonly ICarRepository _carRepo;
    private readonly IFactoryRepository _factoryRepo; 

    public CarService(ICarRepository carRepo, IFactoryRepository factoryRepo)
    {
        _carRepo = carRepo;
        _factoryRepo = factoryRepo;
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
        if (!await _factoryRepo.ExistsAsync(factoryId))
        {
            return null; 
        }

        var cars = await _carRepo.GetByFactoryIdAsync(factoryId);
        return cars.Select(c => new CarResponseDto { Id = c.Id, ModelName = c.ModelName, FactoryId = c.FactoryId });
    }

    public async Task<CarResponseDto?> CreateAsync(CarCreateDto dto)
    {
        if (!await _factoryRepo.ExistsAsync(dto.FactoryId))
        {
            return null; 
        }

        var car = new Car { ModelName = dto.ModelName, FactoryId = dto.FactoryId };
        await _carRepo.AddAsync(car);

        return new CarResponseDto { Id = car.Id, ModelName = car.ModelName, FactoryId = car.FactoryId };
    }

    public async Task<bool?> UpdateAsync(int id, CarCreateDto dto)
    {
        var car = await _carRepo.GetByIdAsync(id);
        if (car == null) return false; 

        if (!await _factoryRepo.ExistsAsync(dto.FactoryId))
        {
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
        return true;
    }
}