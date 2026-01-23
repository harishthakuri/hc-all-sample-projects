using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MOQCoreAPI.Exceptions
{
    public class InvalidGuidException : ApplicationBaseException
    {
        public override string Reason => "InvalidIdException";

        //public InvalidGuidException() : base() { }  
        public InvalidGuidException(string name, object key) : base($"Invalid id ({key}). Id should contain 32 digits with 4 dashes (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).") { }

        //public InvalidGuidException(string name, object key) : base($"Invalid \"{name}\" id ({key}). Id should contain 32 digits with 4 dashes (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx). ") { }
        public InvalidGuidException(string message, Exception ex) : base(message, ex) { }
    }
}
