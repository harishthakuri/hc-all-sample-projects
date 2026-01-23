using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MOQCoreAPI.Exceptions
{
    [Serializable]
    [ExcludeFromCodeCoverage]
    public abstract class ApplicationBaseException : Exception
    {
        public IDictionary<string, string[]> Errors { get; }
        public abstract string Reason { get; }
        protected ApplicationBaseException() : this(string.Empty) { }
        protected ApplicationBaseException(string message) : base(message)
        {
            Errors = new Dictionary<string, string[]>();
        }
        protected ApplicationBaseException(string message, Exception ex) : base(message, ex) { }
        protected ApplicationBaseException(System.Runtime.Serialization.SerializationInfo info,
            System.Runtime.Serialization.StreamingContext context) : base(info, context) { }

    }
}
