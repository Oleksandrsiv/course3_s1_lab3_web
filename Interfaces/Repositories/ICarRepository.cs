using course3_s1_lab1_web.Models;

namespace course3_s1_lab1_web.Interfaces;

public interface ICarRepository
{
    Task<IEnumerable<Car>> GetAllAsync();
    Task<Car?> GetByIdAsync(int id);
    Task<IEnumerable<Car>?> GetByFactoryIdAsync(int factoryId);
    Task AddAsync(Car car);
    Task UpdateAsync(Car car);
    Task DeleteAsync(Car car);
}