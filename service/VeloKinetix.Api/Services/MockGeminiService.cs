using VeloKinetix.Api.Models;

namespace VeloKinetix.Api.Services;

public class MockGeminiService(ILogger<MockGeminiService> logger) : IGeminiService
{
    public async Task<AnalyseResponse> AnalyseAsync(AnalyseRequest request, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Using MockGeminiService — no real Gemini API call made. Set Gemini:UseMock=false to hit the real API.");

        await Task.Delay(600, cancellationToken);

        return new AnalyseResponse
        {
            Success = true,
            RidingStyle = request.RidingStyle,
            RiderAdjustments =
            [
                new Adjustment
                {
                    Title = "Neutral Pelvic Tilt",
                    Detail = "Focus on keeping a neutral pelvis rather than letting the lower back round on longer efforts. Engaging the core helps stabilise this.",
                    Impact = "Medium",
                    Zone = "Lower back"
                },
                new Adjustment
                {
                    Title = "Relaxed Shoulder Position",
                    Detail = "Shoulders appear slightly hunched toward the bars. Consciously dropping and relaxing them reduces upper-body fatigue on longer rides.",
                    Impact = "Low",
                    Zone = "Shoulders"
                }
            ],
            BikeAdjustments = new BikeAdjustments
            {
                Free =
                [
                    new Adjustment
                    {
                        Title = "Saddle Fore-Aft Check",
                        Detail = "Try sliding the saddle a few millimetres forward on its rails to shorten effective reach slightly.",
                        Impact = "Medium",
                        Zone = "Saddle"
                    }
                ],
                LowCost =
                [
                    new Adjustment
                    {
                        Title = "Thicker Handlebar Grips",
                        Detail = "Slightly thicker grips can reduce hand/wrist pressure on longer rides.",
                        Impact = "Low",
                        Zone = "Handlebar"
                    }
                ],
                HighCost =
                [
                    new Adjustment
                    {
                        Title = "Shorter Stem",
                        Detail = "A stem 10-20mm shorter would reduce reach and allow a more upright, comfortable position.",
                        Impact = "Medium",
                        Zone = "Stem"
                    }
                ]
            },
            AnalysisLimitations =
            [
                "Mock response — MockGeminiService generated this locally; no photos were analysed and no Gemini API call was made."
            ],
            Disclaimer = "This is a mock analysis generated for local development and is not real AI output."
        };
    }
}
