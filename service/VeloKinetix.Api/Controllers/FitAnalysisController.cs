using Microsoft.AspNetCore.Mvc;
using VeloKinetix.Api.Models;
using VeloKinetix.Api.Services;

namespace VeloKinetix.Api.Controllers;

[ApiController]
[Route("api/fitanalysis")]
public class FitAnalysisController(
    IValidationService validationService,
    IGeminiService geminiService,
    ILogger<FitAnalysisController> logger) : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "ok" });

    [HttpPost("analyse")]
    public async Task<IActionResult> Analyse([FromBody] AnalyseRequest request, CancellationToken cancellationToken)
    {
        var errors = validationService.Validate(request);
        if (errors.Count > 0)
        {
            return BadRequest(new { errors });
        }

        try
        {
            var result = await geminiService.AnalyseAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (GeminiException ex)
        {
            logger.LogWarning(ex, "Gemini upstream failure");
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }
}
