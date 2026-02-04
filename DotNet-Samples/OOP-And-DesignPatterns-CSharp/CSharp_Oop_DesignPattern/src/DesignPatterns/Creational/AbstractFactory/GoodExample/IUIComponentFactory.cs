using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.AbstractFactory.GoodExample
{
    public interface IUIComponentFactory
    {
        IButton CreateButton();
        ICheckbox CreateCheckbox();
    }
}