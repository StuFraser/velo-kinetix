using VeloKinetix.Api.Middleware;
using VeloKinetix.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpClient("Gemini", client =>
{
    client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
});

builder.Services.AddScoped<IValidationService, ValidationService>();
builder.Services.AddScoped<IPromptService, PromptService>();

// Development defaults to a mock Gemini response to avoid burning real API quota while testing.
// Set Gemini:UseMock=false (env var: Gemini__UseMock=false) to hit the real API locally.
var useMockGemini = builder.Environment.IsDevelopment()
    && builder.Configuration.GetValue("Gemini:UseMock", true);
if (useMockGemini)
{
    builder.Services.AddScoped<IGeminiService, MockGeminiService>();
}
else
{
    builder.Services.AddScoped<IGeminiService, GeminiService>();
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
