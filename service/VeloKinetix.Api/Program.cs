using VeloKinetix.Api.Middleware;
using VeloKinetix.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpClient("Gemini", client =>
{
    client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
});

builder.Services.AddHttpClient("GitHub", client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
    client.DefaultRequestHeaders.Add("User-Agent", "VeloKinetix");
});

builder.Services.AddScoped<IValidationService, ValidationService>();
builder.Services.AddScoped<IPromptService, PromptService>();
builder.Services.AddScoped<IFeedbackValidationService, FeedbackValidationService>();

// Development defaults to a mock Gemini response to avoid burning real API quota while testing.
// Set Gemini:UseMock=false (env var: Gemini__UseMock=false) to hit the real API locally.
// var useMockGemini = builder.Environment.IsDevelopment()
//     && builder.Configuration.GetValue("Gemini:UseMock", true);

var useMockGemini = false;

if (useMockGemini)
{
    builder.Services.AddScoped<IGeminiService, MockGeminiService>();
}
else
{
    builder.Services.AddScoped<IGeminiService, GeminiService>();
}

// Development defaults to a mock GitHub Discussions response to avoid creating real discussions
// while testing. Set GitHub:UseMock=false (env var: GitHub__UseMock=false) to hit the real API locally.
var useMockGitHub = builder.Environment.IsDevelopment() && builder.Configuration.GetValue("GitHub:UseMock", true);
if (useMockGitHub)
{
    // Singleton (not scoped, unlike the services above): GitHubDiscussionsService caches the
    // repo/category GraphQL node IDs in a static field for the process lifetime, and this mock
    // doesn't need per-request state either.
    builder.Services.AddSingleton<IGitHubDiscussionsService, MockGitHubDiscussionsService>();
}
else
{
    builder.Services.AddSingleton<IGitHubDiscussionsService, GitHubDiscussionsService>();
}

const string CorsPolicyName = "VeloKinetixCors";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<RequestLoggingMiddleware>();

app.UseHttpsRedirection();
app.UseCors(CorsPolicyName);
app.MapControllers();

app.Run();
