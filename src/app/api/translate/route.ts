import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body;

    // Validate required fields
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // Demo translation (without OpenAI API key)
    const translations: { [key: string]: string } = {
      'en': 'Hello World',
      'tr': 'Merhaba Dünya',
      'es': 'Hola Mundo',
      'fr': 'Bonjour le Monde',
      'de': 'Hallo Welt'
    };

    const translatedText = translations[targetLanguage] || text;

    console.log('Translation request:', {
      text,
      targetLanguage,
      translatedText,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      originalText: text,
      translatedText,
      targetLanguage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Translation API endpoint',
    endpoints: {
      POST: 'Translate text to target language'
    },
    supportedLanguages: ['en', 'tr', 'es', 'fr', 'de']
  });
}