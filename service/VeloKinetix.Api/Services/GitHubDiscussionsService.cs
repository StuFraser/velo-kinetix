using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace VeloKinetix.Api.Services;

public interface IGitHubDiscussionsService
{
    Task<string> CreateDiscussionAsync(string category, string message, CancellationToken cancellationToken);
}

public class GitHubDiscussionsException(string message) : Exception(message);

public class GitHubDiscussionsService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<GitHubDiscussionsService> logger) : IGitHubDiscussionsService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    // Repo/category IDs are static for the lifetime of the process — a repo's discussion
    // categories essentially never change — so they're looked up once and cached here rather
    // than re-fetched on every submission. Guarded by a lock to avoid duplicate concurrent
    // lookups on cold start. This service is registered as a singleton so the cache persists.
    private static readonly SemaphoreSlim CacheLock = new(1, 1);
    private static string? _repositoryId;
    private static Dictionary<string, string>? _categoryIdsByName;

    public async Task<string> CreateDiscussionAsync(string category, string message, CancellationToken cancellationToken)
    {
        var token = configuration["GitHub:Token"];
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new GitHubDiscussionsException("GitHub API error: no token configured on the server.");
        }

        var client = httpClientFactory.CreateClient("GitHub");
        await EnsureRepositoryMetadataAsync(client, token, cancellationToken);

        if (!_categoryIdsByName!.TryGetValue(category, out var categoryId))
        {
            throw new GitHubDiscussionsException(
                $"GitHub API error: discussion category '{category}' was not found on the repository.");
        }

        const string mutation = """
            mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
              createDiscussion(input: {
                repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body
              }) {
                discussion { id url }
              }
            }
            """;

        var title = $"Feedback: {category} — {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC";
        var variables = new { repositoryId = _repositoryId, categoryId, title, body = message };

        var result = await ExecuteGraphQlAsync<CreateDiscussionResponse>(client, token, mutation, variables, cancellationToken);
        var url = result?.CreateDiscussion?.Discussion?.Url;
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new GitHubDiscussionsException("GitHub API error: discussion was not created.");
        }

        return url;
    }

    private async Task EnsureRepositoryMetadataAsync(HttpClient client, string token, CancellationToken cancellationToken)
    {
        if (_repositoryId is not null && _categoryIdsByName is not null)
        {
            return;
        }

        await CacheLock.WaitAsync(cancellationToken);
        try
        {
            if (_repositoryId is not null && _categoryIdsByName is not null)
            {
                return;
            }

            var owner = configuration["GitHub:RepositoryOwner"];
            var name = configuration["GitHub:RepositoryName"];
            if (string.IsNullOrWhiteSpace(owner) || string.IsNullOrWhiteSpace(name))
            {
                throw new GitHubDiscussionsException("GitHub API error: repository owner/name not configured on the server.");
            }

            const string query = """
                query($owner: String!, $name: String!) {
                  repository(owner: $owner, name: $name) {
                    id
                    discussionCategories(first: 10) {
                      nodes { id name }
                    }
                  }
                }
                """;

            var result = await ExecuteGraphQlAsync<RepositoryMetadataResponse>(
                client, token, query, new { owner, name }, cancellationToken);

            var repository = result?.Repository
                ?? throw new GitHubDiscussionsException("GitHub API error: repository not found.");

            _repositoryId = repository.Id;
            _categoryIdsByName = repository.DiscussionCategories.Nodes.ToDictionary(n => n.Name, n => n.Id);
        }
        finally
        {
            CacheLock.Release();
        }
    }

    private async Task<T?> ExecuteGraphQlAsync<T>(
        HttpClient client, string token, string query, object variables, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "graphql")
        {
            Content = JsonContent.Create(new { query, variables }, options: JsonOptions)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        HttpResponseMessage httpResponse;
        try
        {
            httpResponse = await client.SendAsync(request, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "GitHub GraphQL request failed");
            throw new GitHubDiscussionsException($"GitHub API error: {ex.Message}");
        }

        var body = await httpResponse.Content.ReadAsStringAsync(cancellationToken);

        if (!httpResponse.IsSuccessStatusCode)
        {
            logger.LogWarning("GitHub GraphQL HTTP failure {StatusCode}: {Body}", (int)httpResponse.StatusCode, body);
            throw new GitHubDiscussionsException(
                $"GitHub API error: HTTP {(int)httpResponse.StatusCode}: {httpResponse.ReasonPhrase}");
        }

        // GitHub's GraphQL endpoint returns 200 OK even when the query/mutation fails —
        // errors live in the response body's `errors` array, not the HTTP status code.
        var envelope = JsonSerializer.Deserialize<GraphQlEnvelope<T>>(body, JsonOptions);
        if (envelope?.Errors is { Count: > 0 })
        {
            var messages = string.Join("; ", envelope.Errors.Select(e => e.Message));
            logger.LogWarning("GitHub GraphQL returned errors: {Errors}", messages);
            throw new GitHubDiscussionsException($"GitHub API error: {messages}");
        }

        return envelope is null ? default : envelope.Data;
    }

    private class GraphQlEnvelope<T>
    {
        public T? Data { get; set; }
        public List<GraphQlError>? Errors { get; set; }
    }

    private class GraphQlError
    {
        public string Message { get; set; } = "";
    }

    private class RepositoryMetadataResponse
    {
        public RepositoryNode? Repository { get; set; }
    }

    private class RepositoryNode
    {
        public string Id { get; set; } = "";
        public DiscussionCategoriesConnection DiscussionCategories { get; set; } = new();
    }

    private class DiscussionCategoriesConnection
    {
        public List<CategoryNode> Nodes { get; set; } = [];
    }

    private class CategoryNode
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
    }

    private class CreateDiscussionResponse
    {
        public CreateDiscussionPayload? CreateDiscussion { get; set; }
    }

    private class CreateDiscussionPayload
    {
        public DiscussionNode? Discussion { get; set; }
    }

    private class DiscussionNode
    {
        public string Id { get; set; } = "";
        public string Url { get; set; } = "";
    }
}
