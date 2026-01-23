using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MOQCoreAPI.Domain;
using MOQCoreAPI.Repositories;

namespace MOQCoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly IProductRepository _productRepository;

        public ProductController(IProductRepository productRepository, ILogger logger)
        {
            _productRepository = productRepository;
            _logger = logger;
        }

        [Route("AddProduct")]
        [HttpPost]
        public ActionResult AddProduct(Product product)
        {
            //if (string.IsNullOrEmpty(product.Name)) throw new ArgumentNullException("Product name can not be null or empty");

            //if (product.Id <= 0) throw new ArgumentOutOfRangeException("Product id should be greater then 0");

            var result = _productRepository.AddProduct(product);
            return Ok(result);
        }

    }
}
