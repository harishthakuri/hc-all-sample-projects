using MOQCoreAPI.Domain;
using System.Collections.Generic;

namespace MOQCoreAPI.Repositories
{
    public interface IProductRepository
    {
        List<Product> GetAll();
        Product Get(int id);

        bool AddProduct(Product product);
    }
}