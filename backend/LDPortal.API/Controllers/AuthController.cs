using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LDPortal.API.Data;
using LDPortal.API.Models.DTOs;
using LDPortal.API.Services;

namespace LDPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;
    public AuthController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    /// <summary>
    /// Authenticate user and return JWT token
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.Fail("Invalid request data."));

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive);

        if (user == null)
            return Unauthorized(ApiResponse.Fail("Invalid email or password."));

        if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(ApiResponse.Fail("Invalid email or password."));

        var token = _authService.GenerateJwtToken(user);
        var response = new LoginResponse
        {
            Token = token,
            User = new UserDto
            {
                UserId = user.UserId,
                EmployeeCode = user.EmployeeCode,
                FullName = user.FullName,
                Email = user.Email,
                Department = user.Department,
                Role = user.Role,
                Initials = user.Initials
            }
        };

        return Ok(ApiResponse<LoginResponse>.Ok(response, "Login successful."));
    }

    /// <summary>
    /// Get current user profile from JWT token
    /// </summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            return Unauthorized(ApiResponse.Fail("Invalid token."));

        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
            return NotFound(ApiResponse.Fail("User not found."));

        var dto = new UserDto
        {
            UserId = user.UserId,
            EmployeeCode = user.EmployeeCode,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Role = user.Role,
            Initials = user.Initials
        };

        return Ok(ApiResponse<UserDto>.Ok(dto));
    }
}
