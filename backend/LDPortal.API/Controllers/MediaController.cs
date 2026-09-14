using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LDPortal.API.Models.DTOs;

namespace LDPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class MediaController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly ILogger<MediaController> _logger;

    public MediaController(IWebHostEnvironment env, IConfiguration config, ILogger<MediaController> logger)
    {
        _env = env;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Gets a list of available media files in the MediaLibrary folder
    /// </summary>
    [HttpGet("available-files")]
    public IActionResult GetAvailableFiles()
    {
        var mediaPath = Path.Combine(_env.ContentRootPath, "MediaLibrary");

        if (!Directory.Exists(mediaPath))
        {
            return Ok(ApiResponse<List<string>>.Ok(new List<string>()));
        }

        var files = Directory.GetFiles(mediaPath)
            .Select(Path.GetFileName)
            .Where(f => !string.IsNullOrEmpty(f) && IsAllowedExtension(f))
            .OrderBy(f => f)
            .ToList();

        return Ok(ApiResponse<List<string>>.Ok(files!));
    }

    /// <summary>
    /// Upload a media file (video or PDF) to the MediaLibrary folder
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(524_288_000)] // 500 MB
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.Fail("No file provided."));

        // Validate extension
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!IsAllowedExtension(file.FileName))
            return BadRequest(ApiResponse.Fail($"File type '{ext}' is not allowed. Supported: .mp4, .webm, .pdf"));

        // Validate size
        var maxSizeMb = _config.GetValue<int>("MediaSettings:MaxFileSizeMB", 500);
        var maxSizeBytes = (long)maxSizeMb * 1024 * 1024;
        if (file.Length > maxSizeBytes)
            return BadRequest(ApiResponse.Fail($"File exceeds maximum size of {maxSizeMb} MB."));

        var mediaPath = Path.Combine(_env.ContentRootPath, "MediaLibrary");
        if (!Directory.Exists(mediaPath))
            Directory.CreateDirectory(mediaPath);

        // Sanitize filename — keep original name but remove path traversal characters
        var sanitizedName = SanitizeFileName(file.FileName);

        // If file already exists, add a timestamp suffix
        var targetPath = Path.Combine(mediaPath, sanitizedName);
        if (System.IO.File.Exists(targetPath))
        {
            var nameWithoutExt = Path.GetFileNameWithoutExtension(sanitizedName);
            sanitizedName = $"{nameWithoutExt}_{DateTime.UtcNow:yyyyMMddHHmmss}{ext}";
            targetPath = Path.Combine(mediaPath, sanitizedName);
        }

        try
        {
            using var stream = new FileStream(targetPath, FileMode.Create);
            await file.CopyToAsync(stream);

            _logger.LogInformation("Media file uploaded: {FileName} ({Size} bytes)", sanitizedName, file.Length);

            var result = new MediaUploadResult
            {
                FileName = sanitizedName,
                Url = $"/media/{sanitizedName}",
                SizeBytes = file.Length,
                ContentType = file.ContentType
            };

            return Ok(ApiResponse<MediaUploadResult>.Ok(result, "File uploaded successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload media file: {FileName}", file.FileName);
            return StatusCode(500, ApiResponse.Fail("Failed to upload file. Please try again."));
        }
    }

    private static bool IsAllowedExtension(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext == ".mp4" || ext == ".webm" || ext == ".pdf";
    }

    private static string SanitizeFileName(string fileName)
    {
        var name = Path.GetFileName(fileName); // Strip path
        // Replace any invalid characters
        foreach (var c in Path.GetInvalidFileNameChars())
        {
            name = name.Replace(c, '_');
        }
        // Replace spaces with underscores
        name = name.Replace(' ', '_');
        return name;
    }
}
