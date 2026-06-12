using System.Text.Json.Serialization;

namespace assessment.Models;

public class RestfulApiObject
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public RestfulApiObjectData? Data { get; set; }
}

public class RestfulApiObjectData
{
    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("year")]
    public int? Year { get; set; }

    [JsonPropertyName("CPU model")]
    public string? CpuModel { get; set; }

    [JsonPropertyName("Hard disk size")]
    public string? HardDiskSize { get; set; }
}

public class RestfulApiCreateRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public RestfulApiCreateData Data { get; set; } = new();
}

public class RestfulApiCreateData
{
    [JsonPropertyName("price")]
    public decimal Price { get; set; }
}
