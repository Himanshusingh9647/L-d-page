using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.Security.Claims;
using LDPortal.API.Models;

namespace LDPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public NotificationsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                int userId = GetCurrentUserId();
                var notifications = new List<Notification>();
                string connString = _configuration.GetConnectionString("DefaultConnection");

                using (var conn = new SqlConnection(connString))
                using (var cmd = new SqlCommand("sp_GetNotifications", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            notifications.Add(new Notification
                            {
                                NotificationId = reader.GetInt32(reader.GetOrdinal("NotificationId")),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                Message = reader.GetString(reader.GetOrdinal("Message")),
                                Type = reader.GetString(reader.GetOrdinal("Type")),
                                IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                            });
                        }
                    }
                }

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching notifications.", details = ex.Message });
            }
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                string connString = _configuration.GetConnectionString("DefaultConnection");

                using (var conn = new SqlConnection(connString))
                using (var cmd = new SqlCommand("sp_MarkNotificationRead", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@NotificationId", id);
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error marking notification as read.", details = ex.Message });
            }
        }
    }
}
