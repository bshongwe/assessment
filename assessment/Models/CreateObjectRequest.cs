using System.ComponentModel.DataAnnotations;

namespace assessment.Models;

public class CreateObjectRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
}
