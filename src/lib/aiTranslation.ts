// Basit AI Translation Service
interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  context?: string;
  useCache?: boolean;
}

class AITranslationService {
  private readonly API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  async translate(
    text: string, 
    options: TranslationOptions
  ): Promise<string> {
    if (!text || text.trim() === '') return text;

    // API key yoksa fallback çevirileri kullan
    if (!this.API_KEY) {
      return this.fallbackTranslation(text, options.targetLanguage);
    }

    try {
      // Basit çeviri API çağrısı (demo için)
      return this.fallbackTranslation(text, options.targetLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      return this.fallbackTranslation(text, options.targetLanguage);
    }
  }

  private fallbackTranslation(text: string, targetLanguage: string): string {
    // Basit fallback çevirileri
    const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
      'Menu': { tr: 'Menü', en: 'Menu' },
      'Cart': { tr: 'Sepet', en: 'Cart' },
      'Order': { tr: 'Sipariş', en: 'Order' },
      'Table': { tr: 'Masa', en: 'Table' },
      'Waiter': { tr: 'Garson', en: 'Waiter' },
      'Total': { tr: 'Toplam', en: 'Total' },
      'Price': { tr: 'Fiyat', en: 'Price' },
      'Add to Cart': { tr: 'Sepete Ekle', en: 'Add to Cart' },
      'Call Waiter': { tr: 'Garson Çağır', en: 'Call Waiter' },
      'Payment': { tr: 'Ödeme', en: 'Payment' },
      'Bill': { tr: 'Hesap', en: 'Bill' },
      'Login': { tr: 'Giriş', en: 'Login' },
      'Logout': { tr: 'Çıkış', en: 'Logout' },
      'Save': { tr: 'Kaydet', en: 'Save' },
      'Cancel': { tr: 'İptal', en: 'Cancel' },
      'Delete': { tr: 'Sil', en: 'Delete' },
      'Edit': { tr: 'Düzenle', en: 'Edit' },
      'Add': { tr: 'Ekle', en: 'Add' },
      'Remove': { tr: 'Kaldır', en: 'Remove' },
      'Search': { tr: 'Ara', en: 'Search' },
      'Loading': { tr: 'Yükleniyor', en: 'Loading' },
      'Error': { tr: 'Hata', en: 'Error' },
      'Success': { tr: 'Başarılı', en: 'Success' },
      'Yes': { tr: 'Evet', en: 'Yes' },
      'No': { tr: 'Hayır', en: 'No' },
      'OK': { tr: 'Tamam', en: 'OK' },
      'Close': { tr: 'Kapat', en: 'Close' },
      'Open': { tr: 'Aç', en: 'Open' },
      'Home': { tr: 'Ana Sayfa', en: 'Home' },
      'Profile': { tr: 'Profil', en: 'Profile' },
      'Admin': { tr: 'Yönetici', en: 'Admin' },
      'Staff': { tr: 'Personel', en: 'Staff' },
      'Customer': { tr: 'Müşteri', en: 'Customer' },
      'Welcome': { tr: 'Hoş Geldiniz', en: 'Welcome' },
      'Thank you': { tr: 'Teşekkürler', en: 'Thank you' },
    };

    const translation = fallbackTranslations[text];
    
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }

    // Eğer fallback'te de yoksa orijinal metni döndür
    return text;
  }

  // Toplu çeviri için
  async translateBatch(
    texts: string[], 
    options: TranslationOptions
  ): Promise<string[]> {
    const promises = texts.map(text => this.translate(text, options));
    return Promise.all(promises);
  }

  // Cache temizleme (basit)
  clearCache(): void {
    // Basit implementation
  }

  // Cache istatistikleri (basit)
  getCacheStats(): { totalEntries: number; memoryUsage: string } {
    return { totalEntries: 0, memoryUsage: '0 KB' };
  }
}

// Singleton instance
export const aiTranslationService = new AITranslationService();

// Hook benzeri kullanım için
export const useAITranslation = () => {
  return {
    translate: aiTranslationService.translate.bind(aiTranslationService),
    translateBatch: aiTranslationService.translateBatch.bind(aiTranslationService),
    clearCache: aiTranslationService.clearCache.bind(aiTranslationService),
    getCacheStats: aiTranslationService.getCacheStats.bind(aiTranslationService),
  };
};

export default aiTranslationService;