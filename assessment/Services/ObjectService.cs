using assessment.Data;
using assessment.Models;
using Microsoft.EntityFrameworkCore;

namespace assessment.Services;

public class ObjectService(IRestfulApiClient apiClient, AppDbContext dbContext) : IObjectService
{
    public async Task<RestfulApiObject?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var apiObject = await apiClient.GetObjectAsync(id, cancellationToken);
        if (apiObject is null)
            return null;

        await SaveOrUpdateLocalAsync(apiObject, cancellationToken);
        return apiObject;
    }

    public async Task<RestfulApiObject?> CreateAsync(CreateObjectRequest request, CancellationToken cancellationToken = default)
    {
        var apiObject = await apiClient.CreateObjectAsync(request.Name, request.Price, cancellationToken);
        if (apiObject is null)
            return null;

        await SaveOrUpdateLocalAsync(apiObject, cancellationToken);
        return apiObject;
    }

    public async Task<IReadOnlyList<ObjectEntity>> GetAllLocalAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Objects
            .AsNoTracking()
            .OrderBy(o => o.Name)
            .ToListAsync(cancellationToken);
    }

    private async Task SaveOrUpdateLocalAsync(RestfulApiObject apiObject, CancellationToken cancellationToken)
    {
        var existing = await dbContext.Objects
            .FirstOrDefaultAsync(o => o.Id == apiObject.Id, cancellationToken);

        var price = apiObject.Data?.Price ?? 0;

        if (existing is null)
        {
            dbContext.Objects.Add(new ObjectEntity
            {
                Id = apiObject.Id,
                Name = apiObject.Name,
                Price = price,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.Name = apiObject.Name;
            existing.Price = price;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
