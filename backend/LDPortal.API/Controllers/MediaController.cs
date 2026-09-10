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

    public MediaController(IWebHostEnvironment env)
    {
        _env = env;
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
            .Where(f => !string.IsNullOrEmpty(f) && (f.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase) || f.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)))
            .OrderBy(f => f)
            .ToList();

        return Ok(ApiResponse<List<string>>.Ok(files!));
    }
}
