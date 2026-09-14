using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using System;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace LDPortal.API.Services
{
    public class DeadlineNotificationService : BackgroundService
    {
        private readonly ILogger<DeadlineNotificationService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public DeadlineNotificationService(ILogger<DeadlineNotificationService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DeadlineNotificationService is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                        string connString = configuration.GetConnectionString("DefaultConnection");

                        using (var conn = new SqlConnection(connString))
                        using (var cmd = new SqlCommand("sp_GenerateDeadlineNotifications", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            await conn.OpenAsync(stoppingToken);
                            
                            int notificationsGenerated = await cmd.ExecuteNonQueryAsync(stoppingToken);
                            if (notificationsGenerated > 0)
                            {
                                _logger.LogInformation($"Generated {notificationsGenerated} deadline notifications.");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while generating deadline notifications.");
                }

                // Run once every 24 hours (or realistically, for testing, every 1 hour)
                // For this prototype, let's run it every 5 minutes to ensure it can be tested easily.
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
