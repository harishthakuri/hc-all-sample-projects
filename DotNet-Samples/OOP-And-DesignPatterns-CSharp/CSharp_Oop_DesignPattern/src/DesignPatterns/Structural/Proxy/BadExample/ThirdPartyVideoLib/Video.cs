using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Structural.Proxy.BadExample.ThirdPartyVideoLib
{
    public interface Video
    {
        void Render();


        string GetVideoId();
    }

}