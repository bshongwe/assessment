using assessment.Models;
using assessment.Services;
using Microsoft.AspNetCore.Mvc;

namespace assessment.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ObjectsController(IObjectService objectService) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<RestfulApiObject>> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await objectService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RestfulApiObject>> Create(
        [FromBody] CreateObjectRequest request,
        CancellationToken cancellationToken)
    {
        var result = await objectService.CreateAsync(request, cancellationToken);
        return result is null ? BadRequest() : CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ObjectEntity>>> GetAllLocal(CancellationToken cancellationToken)
    {
        var objects = await objectService.GetAllLocalAsync(cancellationToken);
        return Ok(objects);
    }
}
