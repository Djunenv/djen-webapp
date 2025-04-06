import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    // Validate input
    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing image data" },
        { status: 400 }
      );
    }

    // Extract base64 data (assuming format: "data:image/jpeg;base64,...")
    const base64Data = image.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid base64 image format" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Analyze this waste-related image and respond in this exact format without any asterisks or bullet points:
TITLE: Write a clear, brief title
TYPE: Choose one (Illegal Dumping, Missed Collection, Overflowing Bin, Hazardous Waste, Recycling Issue, or Other)
DESCRIPTION: Write a clear, concise description`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", // Assuming JPEG; adjust if needed
        },
      },
    ]);

    const text = await result.response.text();

    // Parse response with fallback values
    const titleMatch = text.match(/TITLE:\s*(.+)/);
    const typeMatch = text.match(/TYPE:\s*(.+)/);
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/);

    const title = titleMatch?.[1]?.trim() || "Untitled Report";
    const specificType = typeMatch?.[1]?.trim() || "Other";
    const description = descMatch?.[1]?.trim() || "No description provided";

    return NextResponse.json({
      title,
      specificType, // Changed to match schema and form
      description,
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
