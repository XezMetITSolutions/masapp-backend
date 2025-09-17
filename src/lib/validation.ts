// Basit validation utilities

// XSS koruması için HTML temizleme
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// SQL injection koruması için string temizleme
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML karakterleri
    .replace(/['"]/g, '') // SQL injection karakterleri
    .replace(/[;\\]/g, '') // Komut karakterleri
    .trim();
}

// Email validasyonu
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Şifre validasyonu
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         password.length <= 128 &&
         /[a-z]/.test(password) && // küçük harf
         /[A-Z]/.test(password) && // büyük harf
         /\d/.test(password) && // rakam
         /[@$!%*?&]/.test(password); // özel karakter
}

// Basit kullanıcı kayıt validasyonu
export function validateUserRegistration(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.length < 2 || data.name.length > 50) {
    errors.push('İsim en az 2, en fazla 50 karakter olmalıdır');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Geçerli bir email adresi giriniz');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Basit restoran validasyonu
export function validateRestaurant(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push('Restoran adı en az 2, en fazla 100 karakter olmalıdır');
  }

  if (!data.address || data.address.length < 10 || data.address.length > 500) {
    errors.push('Adres en az 10, en fazla 500 karakter olmalıdır');
  }

  if (!data.phone || !/^\+?[1-9]\d{1,14}$/.test(data.phone)) {
    errors.push('Geçerli bir telefon numarası giriniz');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Geçerli bir email adresi giriniz');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Güvenli validasyon wrapper
export function safeValidate(validator: (data: any) => { isValid: boolean; errors: string[] }, data: unknown): { success: boolean; data?: any; error?: string } {
  try {
    const result = validator(data);
    if (result.isValid) {
      return { success: true, data };
    } else {
      return { 
        success: false, 
        error: result.errors.join(', ') 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Validation error' 
    };
  }
}

// API response wrapper
export function createSecureResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: string, code?: string) {
  return {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  };
}