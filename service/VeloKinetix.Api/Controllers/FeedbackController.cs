using Microsoft.AspNetCore.Mvc;
using VeloKinetix.Api.Models;
using VeloKinetix.Api.Services;

namespace VeloKinetix.Api.Controllers;

[ApiController]
[Route("api/feedback")]
public class FeedbackController(
    IFeedbackValidationService validationService,
    IGitHubDiscussionsService discussionsService,
    ILogger<FeedbackController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] FeedbackRequest request, CancellationToken cancellationToken)
    {
        var errors = validationService.Validate(request);
        if (errors.Count > 0)
        {
            return BadRequest(new { errors });
        }

        // Honeypot: real users never see or fill this field in. A non-empty value means a bot
        // submitted the form — pretend success without actually creating a discussion.
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            logger.LogInformation("Feedback submission dropped — honeypot field was filled in.");
            return Ok(new FeedbackResponse { Success = true, DiscussionUrl = "" });
        }

        try
        {
            var url = await discussionsService.CreateDiscussionAsync(request.Category, request.Message, cancellationToken);
            return Ok(new FeedbackResponse { Success = true, DiscussionUrl = url });
        }
        catch (GitHubDiscussionsException ex)
        {
            logger.LogWarning(ex, "GitHub Discussions upstream failure");
            return StatusCode(StatusCodes.Status502BadGateway, new { error = ex.Message });
        }
    }
}
