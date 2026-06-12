using System.Net.Http.Json;
using assessment.Models;

namespace assessment.Services;

public class RestfulApiClient(HttpClient httpClient) : IRestfulApiClient
{
    public async Task<RestfulApiObject?> GetObjectAsync(string id, CancellationToken cancellationToken = default)
    {
        return await httpClient.GetFromJsonAsync<RestfulApiObject>($"objects/{id}", cancellationToken);
    }

    public async Task<RestfulApiObject?> CreateObjectAsync(string name, decimal price, CancellationToken cancellationToken = default)
    {
        var request = new RestfulApiCreateRequest
        {
            Name = name,
            Data = new RestfulApiCreateData { Price = price }
        };

        var response = await httpClient.PostAsJsonAsync("objects", request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<RestfulApiObject>(cancellationToken);
    }
}
