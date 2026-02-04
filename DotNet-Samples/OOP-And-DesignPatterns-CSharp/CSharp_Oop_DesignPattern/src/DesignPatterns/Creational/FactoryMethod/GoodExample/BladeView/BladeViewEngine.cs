using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.FactoryMethod.GoodExample.BackendFramework;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.FactoryMethod.GoodExample.Blade
{
    public class BladeViewEngine : ViewEngine
    {
        public string Render(string fileName, Dictionary<string, object> data)
        {
            return "View rendered from " + fileName + " by Blade";
        }
    }
}