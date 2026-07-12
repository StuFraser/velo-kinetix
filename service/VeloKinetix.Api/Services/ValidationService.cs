using VeloKinetix.Api.Models;

namespace VeloKinetix.Api.Services;

public interface IValidationService
{
    List<string> Validate(AnalyseRequest request);
}

public class ValidationService : IValidationService
{
    private const int MaxPhotos = 4;
    private const int MaxPhotoBytes = 8 * 1024 * 1024;
    private const int MaxRiderNotesLength = 2000;

    public List<string> Validate(AnalyseRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.RidingStyle))
        {
            errors.Add("ridingStyle is required.");
        }
        else if (!RidingStyles.Allowed.Contains(request.RidingStyle))
        {
            errors.Add($"ridingStyle must be one of: {string.Join(", ", RidingStyles.Allowed)}.");
        }

        if (request.RiderNotes is { Length: > MaxRiderNotesLength })
        {
            errors.Add($"riderNotes must be {MaxRiderNotesLength} characters or fewer.");
        }

        if (request.Photos is null || request.Photos.Count == 0)
        {
            errors.Add("At least one photo is required.");
        }
        else
        {
            if (request.Photos.Count > MaxPhotos)
            {
                errors.Add($"No more than {MaxPhotos} photos may be submitted.");
            }

            var seenTypes = new HashSet<string>();
            for (var i = 0; i < request.Photos.Count; i++)
            {
                ValidatePhoto(request.Photos[i], i, errors, seenTypes);
            }
        }

        return errors;
    }

    private static void ValidatePhoto(PhotoUpload photo, int index, List<string> errors, HashSet<string> seenTypes)
    {
        if (string.IsNullOrWhiteSpace(photo.PhotoType))
        {
            errors.Add($"photos[{index}].photoType is required.");
        }
        else if (!PhotoTypes.Allowed.Contains(photo.PhotoType))
        {
            errors.Add($"photos[{index}].photoType must be one of: {string.Join(", ", PhotoTypes.Allowed)}.");
        }
        else if (!seenTypes.Add(photo.PhotoType))
        {
            errors.Add($"photos[{index}].photoType '{photo.PhotoType}' is duplicated.");
        }

        if (string.IsNullOrWhiteSpace(photo.MimeType))
        {
            errors.Add($"photos[{index}].mimeType is required.");
        }
        else if (!MimeTypes.Allowed.Contains(photo.MimeType))
        {
            errors.Add($"photos[{index}].mimeType must be one of: {string.Join(", ", MimeTypes.Allowed)}.");
        }

        if (string.IsNullOrWhiteSpace(photo.Base64Data))
        {
            errors.Add($"photos[{index}].base64Data is required.");
            return;
        }

        Span<byte> buffer = new byte[GetDecodedLengthUpperBound(photo.Base64Data.Length)];
        if (!Convert.TryFromBase64String(photo.Base64Data, buffer, out var bytesWritten))
        {
            errors.Add($"photos[{index}].base64Data is not valid base64.");
            return;
        }

        if (bytesWritten > MaxPhotoBytes)
        {
            errors.Add($"photos[{index}] exceeds the {MaxPhotoBytes / (1024 * 1024)}MB size limit.");
        }
    }

    private static int GetDecodedLengthUpperBound(int base64Length) => (base64Length / 4 + 1) * 3;
}
