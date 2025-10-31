import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧪 Testing AWS Bedrock connection...");
    
    const region = process.env.AWS_REGION ?? "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    console.log("📍 AWS Region:", region);
    console.log("🔑 Access Key ID:", accessKeyId ? `${accessKeyId.substring(0, 8)}...` : "MISSING");
    console.log("🔐 Secret Key:", secretAccessKey ? "SET" : "MISSING");
    
    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json({
        success: false,
        error: "AWS credentials not configured",
        details: {
          region,
          hasAccessKeyId: !!accessKeyId,
          hasSecretAccessKey: !!secretAccessKey,
        }
      }, { status: 500 });
    }
    
    const bedrock = createAmazonBedrock({
      region,
      accessKeyId,
      secretAccessKey,
    });
    
    const modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";
    console.log("🤖 Testing model:", modelId);
    
    const model = bedrock(modelId);
    
    // Simple test generation
    const result = await generateText({
      model,
      prompt: "Say 'Hello, Bedrock works!' in exactly 5 words.",
      maxTokens: 50,
    });
    
    console.log("✅ Bedrock test successful!");
    console.log("📝 Response:", result.text);
    
    return NextResponse.json({
      success: true,
      message: "AWS Bedrock connection successful!",
      response: result.text,
      usage: result.usage,
      modelId,
      region,
    });
    
  } catch (error) {
    console.error("❌ Bedrock test failed:", error);
    
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error("❌ Full error:", errorDetails);
    
    return NextResponse.json({
      success: false,
      error: "AWS Bedrock test failed",
      details: errorDetails,
    }, { status: 500 });
  }
}

