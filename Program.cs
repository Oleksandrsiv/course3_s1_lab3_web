using Microsoft.EntityFrameworkCore;
using course3_s1_lab1_web.Data;
using course3_s1_lab1_web.Interfaces;
using course3_s1_lab1_web.Repositories;
using course3_s1_lab1_web.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using course3_s1_lab1_web.Validators;
using Serilog;
using course3_s1_lab1_web.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddMemoryCache();

builder.Services.Configure<CarCatalogSettings>(
    builder.Configuration.GetSection("CarCatalogSettings"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CarCreateDtoValidator>();

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IFactoryRepository, FactoryRepository>();
builder.Services.AddScoped<ICarRepository, CarRepository>();
builder.Services.AddScoped<IFactoryService, FactoryService>();
builder.Services.AddScoped<ICarService, CarService>();

var app = builder.Build();

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();