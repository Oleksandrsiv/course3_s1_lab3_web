using FluentValidation;
using course3_s1_lab1_web.DTOs;

namespace course3_s1_lab1_web.Validators;

public class FactoryCreateDtoValidator : AbstractValidator<FactoryCreateDto>
{
    public FactoryCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Назва фабрики не може бути порожньою.")
            .Must(name => !string.IsNullOrWhiteSpace(name) && name.Trim().Length >= 2)
            .WithMessage("Назва фабрики має містити щонайменше 2 символи без урахування пробілів.")
            .MaximumLength(50).WithMessage("Назва фабрики не може перевищувати 50 символів.");
    }
}