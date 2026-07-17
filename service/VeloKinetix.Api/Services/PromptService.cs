using System.Text;
using VeloKinetix.Api.Models;

namespace VeloKinetix.Api.Services;

public interface IPromptService
{
    string BuildPrompt(string discipline, string ridingStyle, string? riderNotes, IReadOnlyList<PhotoUpload> photos);
}

public class PromptService : IPromptService
{
    public string BuildPrompt(string discipline, string ridingStyle, string? riderNotes, IReadOnlyList<PhotoUpload> photos)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are an expert mountain bike fitter. Analyse the attached rider/bike photos and produce a structured fit assessment.");
        sb.AppendLine();
        sb.AppendLine($"Discipline: {discipline}");
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
        sb.AppendLine("- Riding style modulates expected body position within the discipline, not just the discipline alone: Casual riders typically favour " +
                      "a more upright, comfort-oriented position; Enthusiast riders sit a middle ground (training seriously, not racing); Competitive riders " +
                      "favour a more aggressive, aerodynamic position suited to racing intent (e.g. a Casual Cross Country rider and a Competitive Cross " +
                      "Country rider should not be assessed against the same target position). Weigh both fields together rather than inferring posture from " +
                      "discipline alone.");
        sb.AppendLine("- These are real-world photos: expect imperfect angles, motion blur, outdoor lighting, and background noise.");
        sb.AppendLine("  Where a photo's quality or angle limits what you can assess, say so explicitly in analysisLimitations rather than guessing.");
        sb.AppendLine("- Fewer photos means a narrower basis for judgement: if only the drive-side profile photo is provided (no front-on or bike-only shot), " +
                      "say so in analysisLimitations, widen your hedging accordingly across all sections, and do not make claims that would need a front-on " +
                      "or bike-only view to support (e.g. saddle fore-aft/rotation symmetry, handlebar width, frame geometry not visible from a side profile).");
        sb.AppendLine("- A limitation must not sit only in analysisLimitations while the adjustment it affects is stated as settled fact elsewhere: " +
                      "if something reduces certainty about a specific adjustment (camera angle, obscuring clothing, a static rather than dynamic pose), " +
                      "that adjustment's own impact rating and wording must reflect it — lower the impact and use qualified language " +
                      "(\"appears\", \"looks slightly\", \"worth checking\") instead of stating it as a confirmed measurement.");
        sb.AppendLine("- Avoid false precision: do not give exact millimetre or degree figures (e.g. \"raise saddle 10-15mm\", \"target 140-145 degrees\") " +
                      "from photo-only assessment unless the photos genuinely support that precision (a clear reference point, pedal at bottom-dead-centre, " +
                      "unobstructed view). Prefer directional guidance (\"saddle looks a touch low — try raising it slightly and reassess\") when precision isn't earned by the evidence.");
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
        _ => "unrecognised photo type"
    };
}
