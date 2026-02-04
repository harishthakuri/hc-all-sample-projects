

namespace CSharp_Oop_DesignPatter.SOLID.S.BadExample
{
    public class EmailSender
    {
        public void SendEmail(string message, string recipient)
        {
            // Email sending logic
            Console.WriteLine($"Sending email to {recipient}: {message}");
        }
    }
}