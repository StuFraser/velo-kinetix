namespace VeloKinetix.Api.Models;

public static class Disciplines
{
    public static readonly string[] Allowed =
    [
        "Commuter", "Adventure/Gravel", "Cross Country", "Trail", "Enduro", "Downhill", "Road"
    ];
}

public static class RidingStyles
{
    public static readonly string[] Allowed =
    [
        "Casual", "Enthusiast", "Competitive"
    ];
}

public static class PhotoTypes
{
    public static readonly string[] Allowed =
    [
        "profile_drive", "front_on", "bike_static"
    ];

    public const string Required = "profile_drive";
}

public static class MimeTypes
{
    public static readonly string[] Allowed =
    [
        "image/jpeg", "image/png", "image/webp"
    ];
}

public class PhotoUpload
{
    public string PhotoType { get; set; } = "";
    public string Base64Data { get; set; } = "";
    public string MimeType { get; set; } = "";
}

public class AnalyseRequest
{
    public string Discipline { get; set; } = "";
    public string RidingStyle { get; set; } = "";
    public string? RiderNotes { get; set; }
    public List<PhotoUpload> Photos { get; set; } = [];
}

public class Adjustment
{
    public string Title { get; set; } = "";
    public string Detail { get; set; } = "";
    public string Impact { get; set; } = "";
    public string Zone { get; set; } = "";
}

public class BikeAdjustments
{
    public List<Adjustment> Free { get; set; } = [];
    public List<Adjustment> LowCost { get; set; } = [];
    public List<Adjustment> HighCost { get; set; } = [];
}

public class AnalyseResponse
{
    public bool Success { get; set; } = true;
    public string Discipline { get; set; } = "";
    public string RidingStyle { get; set; } = "";
    public List<Adjustment> RiderAdjustments { get; set; } = [];
    public BikeAdjustments BikeAdjustments { get; set; } = new();
    public List<string> AnalysisLimitations { get; set; } = [];
    public string Disclaimer { get; set; } = "";
}

/// <summary>Shape Gemini is asked to return — everything in AnalyseResponse except fields the API sets itself.</summary>
public class GeminiAnalysisResult
{
    public List<Adjustment> RiderAdjustments { get; set; } = [];
    public BikeAdjustments BikeAdjustments { get; set; } = new();
    public List<string> AnalysisLimitations { get; set; } = [];
    public string Disclaimer { get; set; } = "";
}

public static class FeedbackCategories
{
    public static readonly string[] Allowed = ["Ideas", "Feedback"];
}

public class FeedbackRequest
{
    public string Category { get; set; } = "";
    public string Message { get; set; } = "";

    /// <summary>Honeypot field — real users never see or fill this in. Non-empty means a bot submitted the form.</summary>
    public string? Website { get; set; }
}

public class FeedbackResponse
{
    public bool Success { get; set; } = true;
    public string DiscussionUrl { get; set; } = "";
}
