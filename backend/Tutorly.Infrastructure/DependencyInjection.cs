using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tutorly.Application;
using Tutorly.Infrastructure.Data;
using Tutorly.Infrastructure.Repositories;
using Tutorly.Infrastructure.Security;
using Tutorly.Infrastructure.Services;

namespace Tutorly.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();
        services.AddScoped<ILookupRepository, LookupRepository>();
        services.AddScoped<ITutorRepository, TutorRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<ISavedTutorRepository, SavedTutorRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITutorlyInsightRepository, TutorlyInsightRepository>();
        services.AddScoped<ITutorlyInsightService, TutorlyInsightService>();
        return services;
    }
}
