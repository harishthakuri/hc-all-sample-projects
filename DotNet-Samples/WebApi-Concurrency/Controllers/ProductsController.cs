using Microsoft.AspNetCore.Mvc;

namespace WebApi;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    /// <summary>
    /// Get all products
    /// </summary>
    /// <returns>List of all products</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    /// <summary>
    /// Get a specific product by ID
    /// </summary>
    /// <param name="id">Product ID</param>
    /// <returns>The product if found</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        
        if (product == null)
            return NotFound(new { message = $"Product with ID {id} not found" });

        return Ok(product);
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    /// <param name="dto">Product creation data</param>
    /// <returns>The created product</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    /// <summary>
    /// Update a product (demonstrates OPTIMISTIC concurrency).
    /// 
    /// IMPORTANT: You MUST include the RowVersion from the GET response.
    /// If another user modified the record since you fetched it, you'll get a 409 Conflict.
    /// 
    /// Flow:
    /// 1. GET /api/products/{id} → Get product with RowVersion
    /// 2. Modify the product data
    /// 3. PUT /api/products/{id} → Send update with the SAME RowVersion
    /// 4. If successful, you get new RowVersion for future updates
    /// 5. If 409 Conflict, refresh data and try again
    /// </summary>
    /// <param name="id">Product ID</param>
    /// <param name="dto">Updated product data with RowVersion</param>
    /// <returns>The updated product with new RowVersion</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, UpdateProductDto dto)
    {
        try
        {
            var product = await _productService.UpdateProductAsync(id, dto);
            return Ok(product);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Product with ID {id} not found" });
        }
        catch (ConcurrencyException ex)
        {
            _logger.LogWarning("Concurrency conflict on product {ProductId}: {Message}", id, ex.Message);
            
            // Return 409 Conflict with helpful message
            return Conflict(new
            {
                message = ex.Message,
                errorCode = "CONCURRENCY_CONFLICT",
                suggestion = "Please fetch the latest version of the product and try again"
            });
        }
    }

    /// <summary>
    /// Update product stock (demonstrates OPTIMISTIC concurrency with audit trail).
    /// 
    /// Use positive quantity to add stock (e.g., receiving inventory).
    /// Use negative quantity to remove stock (e.g., selling items).
    /// 
    /// Each stock change creates an audit record in InventoryTransactions.
    /// </summary>
    /// <param name="id">Product ID</param>
    /// <param name="dto">Stock update data</param>
    /// <returns>The updated product</returns>
    [HttpPatch("{id}/stock")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProductDto>> UpdateStock(int id, UpdateStockDto dto)
    {
        try
        {
            var product = await _productService.UpdateStockAsync(id, dto);
            return Ok(product);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Product with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ConcurrencyException ex)
        {
            return Conflict(new
            {
                message = ex.Message,
                errorCode = "CONCURRENCY_CONFLICT",
                suggestion = "Please fetch the latest version of the product and try again"
            });
        }
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    /// <param name="id">Product ID</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            await _productService.DeleteProductAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Product with ID {id} not found" });
        }
    }
}
