using MOQCoreAPI.Domain;
using MOQCoreAPI.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MOQCoreAPI.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private List<Product> db()
        {
            var products = new List<Product>();
            products.Add(new Product { Id = 1, Name = "iPhone 13 Max Pro", Price = 1200 });
            products.Add(new Product { Id = 2, Name = "MacBook Pro 16 M1 Max", Price = 2300 });
            products.Add(new Product { Id = 3, Name = "Dell XPS 17", Price = 2400 });
            return products;
        }

        public bool AddProduct(Product product)    
        {
            if (string.IsNullOrEmpty(product.Name)) throw new ArgumentNullException("Product name can not be null or empty");
            if (product.Id <= 0) throw new ArgumentOutOfRangeException("Product id should be greater then 0");

            var productdb = db();
            productdb.Add(product);
            return true;
        }

        public Product Get(int id)
        {
            if (id <=0) throw new InvalidGuidException(nameof(Product), id);
            
            //this would communicate with a database, web service, file location to return data
            var product = db().Where(x=>x.Id==id).FirstOrDefault();
            if (product == null) throw new NotFoundException(nameof(Product), id);
            return product;
        }

        public List<Product> GetAll()
        {
            //this would communicate with a database, web service, file location to return data
            var products = db();
            return products;
        }

    }
}
