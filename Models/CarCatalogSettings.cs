namespace course3_s1_lab1_web.Models;

public class CarCatalogSettings
{
    public List<string> OfficialModels { get; set; } = new();
    public string UnofficialSuffix { get; set; } = string.Empty;
}