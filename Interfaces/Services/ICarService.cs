using course3_s1_lab1_web.DTOs;

namespace course3_s1_lab1_web.Interfaces;

public interface ICarService
{
    Task<IEnumerable<CarResponseDto>> GetAllAsync();
    Task<CarResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<CarResponseDto>?> GetByFactoryIdAsync(int factoryId);
    Task<CarResponseDto?> CreateAsync(CarCreateDto dto); 
    Task<bool?> UpdateAsync(int id, CarCreateDto dto);
    Task<bool> DeleteAsync(int id);
}