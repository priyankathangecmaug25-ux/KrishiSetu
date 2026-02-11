using Microsoft.Extensions.Localization;

namespace KrishiSetu.Api.Helpers
{
    public interface ILocalizationService
    {
        string GetString(string key);
    }

    public class LocalizationService : ILocalizationService
    {
        private readonly IStringLocalizer<LocalizationService> _localizer;

        public LocalizationService(IStringLocalizer<LocalizationService> localizer)
        {
            _localizer = localizer;
        }

        public string GetString(string key)
        {
            return _localizer[key];
        }
    }
}
