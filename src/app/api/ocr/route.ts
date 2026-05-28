import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert File to Generative Part
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const imageParts = [
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: file.type,
        },
      },
    ];

    const prompt = `
      Analyze this tax document (receipt, invoice, withholding tax slip / bukti potong) and extract the following information. Pay extra attention to the tax type, specifically look for texts like "PPh Pasal 21", "1721", or "Bukti Pemotongan Pajak Penghasilan Pasal 21" and ensure taxType is correctly identified as "pph21" rather than "ppn".
      Return strictly a JSON object without markdown formatting, using this structure:
      {
        "nominal": <number, the main total transaction amount or gross income amount (penghasilan bruto). Look for "Jumlah Penghasilan Bruto" or "Total". Do not include tax amount as nominal unless it's the only amount>,
        "date": <string, date of the document in YYYY-MM-DD format, or null if not found>,
        "vendor": <string, name of the vendor, company, or payer (pemotong pajak). Look for "Nama Pemotong", "Nama Perusahaan", or header logo text>,
        "taxType": <string, determine the tax type based on document headers. Very important: If you see "PPh Pasal 21", "1721-A1", or "1721", return "pph21". Options: "pph21", "ppn", "pph23", "pphUnifikasi", "pphBadan", "bphtb", "pbbP2", "pajakDaerah", "beaMeterai".>
      }
    `;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    let text = '';
    let lastError: any;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        text = response.text();
        break; // Success, break out of loop
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${modelName} failed:`, error.message);
        // If it's not a 503 or 404/429, we might want to stop, but let's just try the next model.
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error('All models failed to process the document.');
    }

    // Clean up markdown code block if Gemini returns it
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json(
      { error: `Failed to process document: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
