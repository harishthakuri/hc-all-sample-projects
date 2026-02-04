
namespace CSharp_Oop_DesignPatter.SOLID.D.BetterExample
{
    public class Car
    {
        private IEngine engine;

        public Car(IEngine engine)
        {
            this.engine = engine;
        }

        public void StartCar()
        {
            engine.Start();
            System.Console.WriteLine("Car started.");
        }
    }
}