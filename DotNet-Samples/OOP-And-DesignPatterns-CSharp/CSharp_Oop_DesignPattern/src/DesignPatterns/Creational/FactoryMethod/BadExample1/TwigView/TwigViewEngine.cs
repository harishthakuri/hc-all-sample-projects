using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.FactoryMethod.BadExample.BackendFramework;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.FactoryMethod.BadExample.TwigFramwork
{
    public class TwigViewEngine : ViewEngine
    {
        public string Render(string fileName, Dictionary<string, object> data)
        {
            return "View rendered from " + fileName + " by Twig";
        }
    }
}