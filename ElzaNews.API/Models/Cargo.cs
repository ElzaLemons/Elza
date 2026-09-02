namespace ElzaNews.API.Models
{
    public class Cargo
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int NivelAcesso { get; set; } = int.MinValue;
    }
}