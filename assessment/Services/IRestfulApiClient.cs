using assessment.Models;

namespace assessment.Services;

public interface IRestfulApiClient
{
    Task<RestfulApiObject?> GetObjectAsync(string id, CancellationToken cancellationToken = default);
    Task<RestfulApiObject?> CreateObjectAsync(string name, decimal price, CancellationToken cancellationToken = default);
}
