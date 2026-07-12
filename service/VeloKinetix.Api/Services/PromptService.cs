using System.Text;
using VeloKinetix.Api.Models;

namespace VeloKinetix.Api.Services;

public interface IPromptService
{
    string BuildPrompt(string ridingStyle, string? riderNotes, IReadOnlyList<PhotoUpload> photos);
}

public class PromptService : IPromptService
{
    public string BuildPrompt(string ridingStyle, string? riderNotes, IReadOnlyList<PhotoUpload> photos)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are an expert mountain bike fitter. Analyse the attached rider/bike photos and produce a structured fit assessment.");
        sb.AppendLine();
        sb.AppendLine($"Riding style: {ridingStyle}");
        sb.AppendLine();

        AppendPhotoManifest(sb, photos);

        if (!string.IsNullOrWhiteSpace(riderNotes))
        {
            sb.AppendLine();
            sb.AppendLine("Rider-supplied context (weigh this when forming BOTH rider adjustments and bike adjustments — " +
                          "do not just append it as a footnote):");
            sb.AppendLine(riderNotes.Trim());
        }

        sb.AppendLine();
        sb.AppendLine("Guidance:");
        sb.AppendLine("- These are real-world photos: expect imperfect angles, motion blur, outdoor lighting, and background noise.");
        sb.AppendLine("  Where a photo's quality or angle limits what you can assess, say so explicitly in analysisLimitations rather than guessing.");
        sb.AppendLine("- riderAdjustments covers body position, posture, and technique the rider can change without touching the bike.");
        sb.AppendLine("- bikeAdjustments covers physical changes to the bike, split into free (existing part re-adjustment), " +
                      "lowCost (under $50), and highCost (over $50) buckets.");
        sb.AppendLine("- impact must be exactly one of: High, Medium, Low.");
        sb.AppendLine("- zone is the body area or bike component affected (e.g. \"Lower back\", \"Saddle\", \"Stem\").");
        sb.AppendLine("- disclaimer must note this is an AI-generated analysis and not a substitute for a professional in-person bike fit.");
        sb.AppendLine("- Respond ONLY with JSON matching the supplied response schema. No prose outside the JSON.");

        return sb.ToString();
    }

    private static void AppendPhotoManifest(StringBuilder sb, IReadOnlyList<PhotoUpload> photos)
    {
        sb.AppendLine("Attached photos, in order:");
        foreach (var photo in photos)
        {
            sb.AppendLine($"- {photo.PhotoType}: {DescribePhotoType(photo.PhotoType)}");
        }
    }

    private static string DescribePhotoType(string photoType) => photoType switch
    {
        "profile_drive" => "rider profile, drive (chain) side, pedals near 6/12 o'clock",
        "front_on" => "rider facing the camera",
        "bike_static" => "bike only, roughly 45 degree angle, no rider",
        "profile_nondrive" => "rider profile, non-drive side",
        _ => "unrecognised photo type"
    };
}
