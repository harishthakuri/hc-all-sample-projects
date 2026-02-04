using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.FactoryMethod.BadExample2.BackendFramework;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.FactoryMethod.BadExample2.TwigFramwork
{
    public class TwigViewEngine : ViewEngine
    {
        public string Render(string fileName, Dictionary<string, object> data)
        {
            return "View rendered from " + fileName + " by Twig";
        }
    }
}