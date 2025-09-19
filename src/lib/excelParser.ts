// Basit Excel Parser

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  tags?: string[];
  calories?: number;
  allergens?: string[];
}

export interface ImportProgress {
  total: number;
  processed: number;
  success: number;
  errors: number;
  currentItem?: string;
  status: 'idle' | 'parsing' | 'completed' | 'error';
}

export interface ImportResult {
  success: boolean;
  items: MenuItem[];
  errors: string[];
  processingTime: number;
}

class ExcelParser {
  private progressCallback?: (progress: ImportProgress) => void;

  constructor(progressCallback?: (progress: ImportProgress) => void) {
    this.progressCallback = progressCallback;
  }

  // Basit Excel dosyası parse etme
  async parseExcelFile(file: File): Promise<MenuItem[]> {
    this.updateProgress({
      total: 0,
      processed: 0,
      success: 0,
      errors: 0,
      status: 'parsing',
      currentItem: 'Excel dosyası okunuyor...'
    });

    try {
      // Demo için basit CSV parsing
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const items: MenuItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim());
        if (row.length >= 4) {
          const item: MenuItem = {
            id: row[0] || `item_${i}`,
            name: row[1] || '',
            description: row[2] || '',
            price: parseFloat(row[3]) || 0,
            category: row[4] || 'Other',
            imageUrl: row[5] || '',
            isAvailable: row[6] === 'true' || row[6] === '1',
            tags: row[7] ? row[7].split(',').map(tag => tag.trim()) : [],
            calories: row[8] ? parseInt(row[8]) : undefined,
            allergens: row[9] ? row[9].split(',').map(allergen => allergen.trim()) : []
          };

          if (item.name) {
            items.push(item);
          }
        }
      }

      this.updateProgress({
        total: items.length,
        processed: items.length,
        success: items.length,
        errors: 0,
        status: 'completed',
        currentItem: `${items.length} ürün başarıyla parse edildi`
      });

      return items;
    } catch (error) {
      console.error('Excel parse hatası:', error);
      throw new Error('Excel dosyası okunamadı');
    }
  }

  // Ana import fonksiyonu
  async importMenuFromExcel(file: File): Promise<ImportResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      const items = await this.parseExcelFile(file);
      
      return {
        success: true,
        items,
        errors,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Bilinmeyen hata');
      return {
        success: false,
        items: [],
        errors,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Progress güncelleme
  private updateProgress(progress: ImportProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

export default ExcelParser;

