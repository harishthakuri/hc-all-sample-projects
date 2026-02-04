using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CSharp_Oop_DesignPatter.src.DesignPatterns.Structural.Adapter
{
    public class VideoEditor
    {
        private Video _video;

        public VideoEditor(Video video)
        {
            _video = video;
        }

        public void ApplyColor(Color color)
        {
            color.Apply(_video);
        }
    }
}