using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.ChainOfResponsibility.BadExample
{
    public class Validator
    {
        public void Validate(HttpRequest request)
        {
            var username = request.GetUsername();
            var password = request.GetPassword();

            // Trim whitespace
            request.ValidatedUsername = username.Trim();
            request.ValidatedPassword = password.Trim();
        }
    }
}