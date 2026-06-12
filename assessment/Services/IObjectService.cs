using assessment.Models;

namespace assessment.Services;

public interface IObjectService
{
    Task<RestfulApiObject?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<RestfulApiObject?> CreateAsync(CreateObjectRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ObjectEntity>> GetAllLocalAsync(CancellationToken cancellationToken = default);
}
