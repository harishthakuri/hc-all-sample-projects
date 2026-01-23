using FluentValidation;

namespace MOQCoreAPI.Domain
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string Email { get; set; }
        public string NotifactionType { get; set; }
        public string ZipCode { get; set; }

    }


    public class ProductValidator : AbstractValidator<Product>
    {
        public ProductValidator()
        {
            RuleFor(moded => moded.Name).NotEmpty().WithMessage("Product name is empty.");
            RuleFor(model => model.Email).NotEmpty().WithMessage("Email is required.");
            RuleFor(model => model.NotifactionType).Matches("push|text|email|dial");
            RuleFor(model => model.ZipCode).Matches(@"^[\d]*$");
        }

    }
}
