using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Visitor.BadExample;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Behavioral.Visitor.GoodExample
{
    public interface Visitor
    {
        void VisitRetail(Retail retail);

        void VisitLaw(Law law);

        void VisitRestaurant(Restaurant restaurant);
    }
}