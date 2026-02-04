using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Creational.Builder.GoodExample.Components
{
    public class Dashboard
    {
        private bool _hasRevCounter = false;

        public Dashboard(bool hasRevCounter)
        {
            _hasRevCounter = hasRevCounter;
        }
    }
}