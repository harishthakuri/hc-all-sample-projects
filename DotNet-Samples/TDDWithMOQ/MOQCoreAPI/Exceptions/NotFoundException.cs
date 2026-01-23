using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MOQCoreAPI.Exceptions
{
    public class NotFoundException : ApplicationBaseException
    {
        public override string Reason => "NotFoundException";

         public NotFoundException():base() {} 
        public NotFoundException(string name, object key) : base($"{name} - No record found for the id {key}") { }
        public NotFoundException(string message, Exception ex) : base(message, ex) { }
    }
}
