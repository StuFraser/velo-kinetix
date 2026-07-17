using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using VeloKinetix.Api.Models;

namespace VeloKinetix.Api.Services;

public interface IGeminiService
{
    Task<AnalyseResponse> AnalyseAsync(AnalyseRequest request, CancellationToken cancellationToken);
}

public class GeminiException(string message) : Exception(message);

public class GeminiService(
    IHttpClientFactory httpClientFactory,
    IPromptService promptService,
    IConfiguration configuration,
    ILogger<GeminiService> logger) : IGeminiService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    // Adjustment shape is duplicated four times below (Gemini's schema dialect has no $ref support) —
    // this is static schema data, not logic, so the repetition doesn't carry the usual DRY cost.
    private static readonly JsonNode ResponseSchema = JsonNode.Parse("""
    {
      "type": "OBJECT",
      "properties": {
        "riderAdjustments": {
          "type": "ARRAY",
          "items": {
            "type": "OBJECT",
            "properties": {
              "title": { "type": "STRING" },
              "detail": { "type": "STRING" },
              "impact": { "type": "STRING", "enum": ["High", "Medium", "Low"] },
              "zone": { "type": "STRING" }
            },
            "required": ["title", "detail", "impact", "zone"]
          }
        },
        "bikeAdjustments": {
          "type": "OBJECT",
          "properties": {
            "free": {
              "type": "ARRAY",
              "items": {
                "type": "OBJECT",
                "properties": {
                  "title": { "type": "STRING" },
                  "detail": { "type": "STRING" },
                  "impact": { "type": "STRING", "enum": ["High", "Medium", "Low"] },
                  "zone": { "type": "STRING" }
                },
                "required": ["title", "detail", "impact", "zone"]
              }
            },
            "lowCost": {
              "type": "ARRAY",
              "items": {
                "type": "OBJECT",
                "properties": {
                  "title": { "type": "STRING" },
                  "detail": { "type": "STRING" },
                  "impact": { "type": "STRING", "enum": ["High", "Medium", "Low"] },
                  "zone": { "type": "STRING" }
                },
                "required": ["title", "detail", "impact", "zone"]
              }
            },
            "highCost": {
              "type": "ARRAY",
              "items": {
                "type": "OBJECT",
                "properties": {
                  "title": { "type": "STRING" },
                  "detail": { "type": "STRING" },
                  "impact": { "type": "STRING", "enum": ["High", "Medium", "Low"] },
                  "zone": { "type": "STRING" }
                },
                "required": ["title", "detail", "impact", "zone"]
              }
            }
          },
          "required": ["free", "lowCost", "highCost"]
        },
        "analysisLimitations": {
          "type": "ARRAY",
          "items": { "type": "STRING" }
        },
        "disclaimer": { "type": "STRING" }
      },
      "required": ["riderAdjustments", "bikeAdjustments", "analysisLimitations", "disclaimer"]
    }
    """)!;

    public async Task<AnalyseResponse> AnalyseAsync(AnalyseRequest request, CancellationToken cancellationToken)
    {
        var apiKey = configuration["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new GeminiException("Gemini API error: no API key configured on the server.");
        }

        var model = configuration["Gemini:Model"] ?? "gemini-flash-latest";
        var prompt = promptService.BuildPrompt(request.Discipline, request.RidingStyle, request.RiderNotes, request.Photos);

        var parts = new List<GeminiPart> { new() { Text = prompt } };
        parts.AddRange(request.Photos.Select(photo => new GeminiPart
        {
            InlineData = new GeminiInlineData { MimeType = photo.MimeType, Data = photo.Base64Data }
        }));

        var geminiRequest = new GeminiRequest
        {
            Contents = [new GeminiContent { Parts = parts }],
            GenerationConfig = new GeminiGenerationConfig
            {
                ResponseMimeType = "application/json",
                ResponseSchema = ResponseSchema
            }
        };

        var client = httpClientFactory.CreateClient("Gemini");
        HttpResponseMessage httpResponse;
        try
        {
            httpResponse = await client.PostAsJsonAsync(
                $"v1beta/models/{model}:generateContent?key={apiKey}",
                geminiRequest,
                JsonOptions,
                cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Gemini API request failed");
            throw new GeminiException($"Gemini API error: {ex.Message}");
        }

        if (!httpResponse.IsSuccessStatusCode)
        {
            var body = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning("Gemini API returned {StatusCode}: {Body}", (int)httpResponse.StatusCode, body);
            throw new GeminiException(
                $"Gemini API error: HTTP {(int)httpResponse.StatusCode}: {httpResponse.ReasonPhrase}");
        }

        var apiResponse = await httpResponse.Content.ReadFromJsonAsync<GeminiApiResponse>(JsonOptions, cancellationToken);
        var resultText = apiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
        if (string.IsNullOrWhiteSpace(resultText))
        {
            throw new GeminiException("Gemini API error: empty response.");
        }

        GeminiAnalysisResult? result;
        try
        {
            result = JsonSerializer.Deserialize<GeminiAnalysisResult>(resultText, JsonOptions);
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to parse Gemini response body: {Body}", resultText);
            throw new GeminiException("Gemini API error: could not parse response.");
        }

        if (result is null)
        {
            throw new GeminiException("Gemini API error: could not parse response.");
        }

        return new AnalyseResponse
        {
            Success = true,
            Discipline = request.Discipline,
            RidingStyle = request.RidingStyle,
            RiderAdjustments = result.RiderAdjustments,
            BikeAdjustments = result.BikeAdjustments,
            AnalysisLimitations = result.AnalysisLimitations,
            Disclaimer = result.Disclaimer
        };
    }

    private class GeminiRequest
    {
        public List<GeminiContent> Contents { get; set; } = [];
        public GeminiGenerationConfig GenerationConfig { get; set; } = new();
    }

    private class GeminiContent
    {
        public List<GeminiPart>? Parts { get; set; }
    }

    private class GeminiPart
    {
        public string? Text { get; set; }
        public GeminiInlineData? InlineData { get; set; }
    }

    private class GeminiInlineData
    {
        public string MimeType { get; set; } = "";
        public string Data { get; set; } = "";
    }

    private class GeminiGenerationConfig
    {
        public string ResponseMimeType { get; set; } = "application/json";
        public JsonNode? ResponseSchema { get; set; }
    }

    private class GeminiApiResponse
    {
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    private class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }
}
