// Basit translation service

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Demo için basit çeviriler
    const translations: { [key: string]: { [key: string]: string } } = {
      'Hello': { tr: 'Merhaba', de: 'Hallo', en: 'Hello' },
      'Menu': { tr: 'Menü', de: 'Speisekarte', en: 'Menu' },
      'Order': { tr: 'Sipariş', de: 'Bestellung', en: 'Order' },
      'Table': { tr: 'Masa', de: 'Tisch', en: 'Table' },
      'Waiter': { tr: 'Garson', de: 'Kellner', en: 'Waiter' },
      'Total': { tr: 'Toplam', de: 'Gesamt', en: 'Total' },
      'Price': { tr: 'Fiyat', de: 'Preis', en: 'Price' },
      'Payment': { tr: 'Ödeme', de: 'Zahlung', en: 'Payment' },
      'Bill': { tr: 'Hesap', de: 'Rechnung', en: 'Bill' },
      'Thank you': { tr: 'Teşekkürler', de: 'Danke', en: 'Thank you' },
    };

    const translation = translations[text];
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }

    // Eğer çeviri bulunamazsa orijinal metni döndür
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
}

export async function detectLanguageFromLocation(countryCode: string): Promise<string> {
  const languageMap: { [key: string]: string } = {
    'TR': 'Turkish',
    'AT': 'German',
    'DE': 'German',
    'CH': 'German',
    'US': 'English',
    'GB': 'English',
    'CA': 'English',
    'AU': 'English',
    'SA': 'Arabic',
    'AE': 'Arabic',
    'EG': 'Arabic',
    'RU': 'Russian',
    'BY': 'Russian',
    'KZ': 'Russian',
  };

  return languageMap[countryCode] || 'English';
}

export const supportedLanguages = {
  'Turkish': { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  'German': { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  'English': { code: 'en', name: 'English', flag: '🇺🇸' },
  'Arabic': { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  'Russian': { code: 'ru', name: 'Русский', flag: '🇷🇺' },
};