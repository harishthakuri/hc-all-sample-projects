using FluentAssertions;
using FluentValidation;
using FluentValidation.TestHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using MOQCoreAPI.Controllers;
using MOQCoreAPI.Domain;
using MOQCoreAPI.Repositories;
using System;
using System.Linq;
using Xunit;

namespace MOQExample.Test.Controllers
{

    public class ProductControllerTest
    {
        readonly ProductController controller;
        private readonly Mock<IProductRepository> _productRepoMock = new Mock<IProductRepository>();
        private readonly Mock<ILogger> _loggerMock = new Mock<ILogger>();
        private readonly ProductValidator _validator =new ProductValidator();


        public ProductControllerTest()
        {
            controller = new ProductController(_productRepoMock.Object, _loggerMock.Object);
        }



        private Product CreateValidProduct()
        {
            return new Product
            {
                Id = 1,
                Name = "Test Product",
                Price = 100.50,
                Email = "test@example.com",
                NotifactionType = "email",
                ZipCode = "12345"
            };
        }

        [Fact]
        public void AddProduct_ReturnBadRequestResult_WhenModelIsInvalid()
        {

            // Arrange
            var product = new Product {
                Id = 1,
                Name = "", // Invalid: empty name to trigger validation error
                Price = 122,
                NotifactionType="invalid", // Invalid: doesn't match pattern "push|text|email|dial"
                ZipCode="98765",
                Email="abc@hotmail.com"
            };

            var result=_validator.TestValidate(product);
             
            //var error=  result.ShouldHaveValidationErrorFor(model => model.Name);
            var error = result.ShouldHaveValidationErrorFor(model => model.Name)
                .WithErrorMessage("Product name is empty.")
                .WithSeverity(Severity.Error)
                .WithErrorCode("NotEmptyValidator");

            var er = result.ShouldHaveAnyValidationError();

            Assert.Equal(2, er.Count());                    
           
        }

        [Fact]
        public void AddProduct_ReturnsOkResult_WhenProductIsValid()
        {
            // Arrange
            var product = CreateValidProduct();
            _productRepoMock.Setup(x => x.AddProduct(It.IsAny<Product>())).Returns(true);

            // Act
            var result = controller.AddProduct(product);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult.Value.Should().Be(true);
            _productRepoMock.Verify(x => x.AddProduct(It.IsAny<Product>()), Times.Once);
        }

        [Fact]
        public void AddProduct_CallsRepositoryWithCorrectProduct()
        {
            // Arrange
            var product = CreateValidProduct();
            _productRepoMock.Setup(x => x.AddProduct(It.IsAny<Product>())).Returns(true);

            // Act
            controller.AddProduct(product);

            // Assert
            _productRepoMock.Verify(x => x.AddProduct(
                It.Is<Product>(p => 
                    p.Id == product.Id &&
                    p.Name == product.Name &&
                    p.Price == product.Price &&
                    p.Email == product.Email &&
                    p.NotifactionType == product.NotifactionType &&
                    p.ZipCode == product.ZipCode
                )), Times.Once);
        }

        [Fact]
        public void AddProduct_ReturnsOkResult_WhenRepositoryReturnsFalse()
        {
            // Arrange
            var product = CreateValidProduct();
            _productRepoMock.Setup(x => x.AddProduct(It.IsAny<Product>())).Returns(false);

            // Act
            var result = controller.AddProduct(product);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult.Value.Should().Be(false);
            _productRepoMock.Verify(x => x.AddProduct(It.IsAny<Product>()), Times.Once);
        }

        [Fact]
        public void AddProduct_ThrowsException_WhenRepositoryThrowsArgumentNullException()
        {
            // Arrange
            var product = CreateValidProduct();
            var exceptionMessage = "Product name can not be null or empty";
            _productRepoMock.Setup(x => x.AddProduct(It.IsAny<Product>()))
                .Throws(new ArgumentNullException(exceptionMessage));

            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(() => controller.AddProduct(product));
            exception.Message.Should().Contain(exceptionMessage);
            _productRepoMock.Verify(x => x.AddProduct(It.IsAny<Product>()), Times.Once);
        }

        [Fact]
        public void AddProduct_ThrowsException_WhenRepositoryThrowsArgumentOutOfRangeException()
        {
            // Arrange
            var product = CreateValidProduct();
            var exceptionMessage = "Product id should be greater then 0";
            _productRepoMock.Setup(x => x.AddProduct(It.IsAny<Product>()))
                .Throws(new ArgumentOutOfRangeException(exceptionMessage));

            // Act & Assert
            var exception = Assert.Throws<ArgumentOutOfRangeException>(() => controller.AddProduct(product));
            exception.Message.Should().Contain(exceptionMessage);
            _productRepoMock.Verify(x => x.AddProduct(It.IsAny<Product>()), Times.Once);
        }

        [Fact]
        public void AddProduct_HandlesNullProduct()
        {
            // Arrange
            Product product = null;
            _productRepoMock.Setup(x => x.AddProduct(It.IsAny<Product>())).Returns(false);

            // Act
            var result = controller.AddProduct(product);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            _productRepoMock.Verify(x => x.AddProduct(It.Is<Product>(p => p == null)), Times.Once);
        }


    }
}
