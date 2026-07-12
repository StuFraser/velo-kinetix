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
builder.Services.AddScoped<IGeminiService, GeminiService>();

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
