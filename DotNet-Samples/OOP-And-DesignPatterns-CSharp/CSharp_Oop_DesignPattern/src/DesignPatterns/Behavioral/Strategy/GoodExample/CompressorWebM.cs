using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Strategy.GoodExample
{
public class CompressorWebM : ICompressor
{
    public void Compress()
    {
        System.Console.WriteLine("Compressing video using WebM");
    }
}
}