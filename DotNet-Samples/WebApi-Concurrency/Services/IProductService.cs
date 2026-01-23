

namespace WebApi;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto);
    Task<ProductDto> UpdateStockAsync(int id, UpdateStockDto dto);
    Task DeleteProductAsync(int id);
}
