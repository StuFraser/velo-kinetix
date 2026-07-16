namespace VeloKinetix.Api.Services;

public class MockGitHubDiscussionsService(ILogger<MockGitHubDiscussionsService> logger) : IGitHubDiscussionsService
{
    public async Task<string> CreateDiscussionAsync(string category, string message, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Using MockGitHubDiscussionsService — no real GitHub Discussion created. Set GitHub:UseMock=false to hit the real API.");
        await Task.Delay(400, cancellationToken);
        return "https://github.com/OWNER/REPO/discussions/1";
    }
}
