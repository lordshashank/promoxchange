import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export interface ExtractedCouponInfo {
  title?: string;
  brand?: string;
  code?: string;
  description?: string;
  expiryDate?: string;
  terms?: string;
  category?: string;
  currency?: string;
}

export async function extractCouponInfo(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedCouponInfo> {
  const prompt = `
Analyze this coupon/discount code image and extract the following information in JSON format:
{
  "title": "Brief title of the offer (e.g., '20% Off Electronics')",
  "brand": "Brand or company name",
  "code": "The coupon/promo code (if visible)",
  "description": "Description of the offer/discount. Use markdown for better formatting if applicable (e.g. bolding, lists).",
  "expiryDate": "Expiration date in ISO 8601 format (YYYY-MM-DD) if visible, otherwise null",
  "terms": "Any terms and conditions mentioned. Use markdown for better formatting (e.g. bullet points for multiple conditions).",
  "category": "Category of the coupon (e.g., 'Food', 'Electronics', 'Fashion', 'Travel', 'Entertainment', 'Other')",
  "currency": "The 3-letter currency code (e.g. USD, EUR, INR) if a specific currency is mentioned or implied by the region (e.g. £ -> GBP). If region-agnostic or universal, use 'Global'."
}

If any field is not visible or not applicable, set it to null or empty string.
Return ONLY the JSON object, no additional text or markdown formatting.
  `.trim();

  // Convert base64 to Blob for uploading to Gemini File API
  const buffer = Buffer.from(imageBase64, 'base64');
  const blob = new Blob([buffer], { type: mimeType });

  // Upload the file to Gemini File API
  const uploadedFile = await genAI.files.upload({
    file: blob,
    config: {
      mimeType,
      displayName: "coupon-screenshot"
    },
  });

  if (!uploadedFile.uri || !uploadedFile.mimeType) {
    throw new Error("Failed to upload file to Gemini File API: URI or MimeType missing");
  }

  // Generate content using the uploaded file reference
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
      "\n\n",
      prompt,
    ]),
  });

  const text = result.text;
  if (!text) {
    throw new Error("No text returned from Gemini");
  }

  // Extract JSON from response (Gemini sometimes wraps in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}
