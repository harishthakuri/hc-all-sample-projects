using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.ChainOfResponsibility.GoodExample
{
    public class Logger : Handler
    {
        public override bool DoHandle(HttpRequest request)
        {
            System.Console.WriteLine("Logging");
            return false;
        }
    }
}