import { modelPicker } from "@/lib/model-picker";
import { auth } from "@/server/auth";
import { streamText } from "ai";
import { NextResponse } from "next/server";
// Use AI SDK types for proper type safety

interface SlidesRequest {
  title: string; // Generated presentation title
  prompt: string; // Original user prompt/request
  outline: string[]; // Array of main topics with markdown content
  language: string; // Language to use for the slides
  tone: string; // Style for image queries (optional)
  modelProvider?: string; // Model provider (openai, ollama, or lmstudio)
  modelId?: string; // Specific model ID for the provider
  searchResults?: Array<{ query: string; results: unknown[] }>; // Search results for context
}
// TODO: Add table and chart to the available layouts
const slidesTemplate = `
You are an expert presentation designer. Your task is to create an engaging presentation in XML format.
## CORE REQUIREMENTS

1. FORMAT: Use <SECTION> tags for each slide
2. CONTENT: DO NOT copy outline verbatim - expand with examples, data, and context
3. VARIETY: Each slide must use a DIFFERENT layout component
4. FOCUS: Create content-rich slides with clear information hierarchy

## PRESENTATION DETAILS
- Title: {TITLE}
- User's Original Request: {PROMPT}
- Current Date: {CURRENT_DATE}
- Outline (for reference only): {OUTLINE_FORMATTED}
- Language: {LANGUAGE}
- Tone: {TONE}
- Total Slides: {TOTAL_SLIDES}

## RESEARCH CONTEXT
{SEARCH_RESULTS}

## PRESENTATION STRUCTURE
\`\`\`xml
<PRESENTATION>

<!-- Each slide must follow this structure -->
<SECTION>
  <!-- Required: include ONE layout component per slide -->
  <!-- Focus on clear, informative content -->
</SECTION>

<!-- Other Slides in the SECTION tag -->

</PRESENTATION>
\`\`\`

## AVAILABLE LAYOUTS
Choose ONE different layout for each slide (use these exact XML tags so our parser recognizes them):

1. COLUMNS: For comparisons
\`\`\`xml
<COLUMNS>
  <DIV><H3>First Concept</H3><P>Description</P></DIV>
  <DIV><H3>Second Concept</H3><P>Description</P></DIV>
</COLUMNS>
\`\`\`

2. BULLETS: For key points
\`\`\`xml
<BULLETS>
  <DIV><H3>Main Point 1 </H3><P>Description</P></DIV>
  <DIV><H3>Main Point 2 </H3><P>Second point with details</P></DIV>
</BULLETS>
\`\`\`

3. ICONS: For concepts with symbols
\`\`\`xml
<ICONS>
  <DIV><ICON query="rocket" /><H3>Innovation</H3><P>Description</P></DIV>
  <DIV><ICON query="shield" /><H3>Security</H3><P>Description</P></DIV>
</ICONS>
\`\`\`

4. CYCLE: For processes and workflows
\`\`\`xml
<CYCLE>
  <DIV><H3>Research</H3><P>Initial exploration phase</P></DIV>
  화<DIV><H3>Design</H3><P>Solution creation phase</P></DIV>
  <DIV><H3>Implement</H3><P>Execution phase</P></DIV>
  <DIV><H3>Evaluate</H3><P>Assessment phase</P></DIV>
</CYCLE>
\`\`\`

5. ARROWS: For cause-effect or flows
\`\`\`xml
<ARROWS>
  <DIV><H3>Challenge</H3><P>Current market problem</P></DIV>
  <DIV><H3>Solution</H3><P>Our innovative approach</P></DIV>
  <DIV><H3>Result</H3><P>Measurable outcomes</P></DIV>
</ARROWS>
\`\`\`

5b. ARROW-VERTICAL: For vertical step-by-step flows (preferred for linear phases)
\`\`\`xml
<ARROW-VERTICAL>
  <DIV><H3>Discover</H3><P>Research & requirements.</P></DIV>
  <DIV><H3>Design</H3><P>UX & architecture.</P></DIV>
  <DIV><H3>Deliver</H3><P>Build, test, deploy.</P></DIV>
</ARROW-VERTICAL>
\`\`\`

6. TIMELINE: For chronological progression
\`\`\`xml
<TIMELINE>
  <DIV><H3>2022</H3><P>Market research completed</P></DIV>
  <DIV><H3>2023</H3><P>Product development phase</P></DIV>
  <DIV><H3>2024</H3><P>Global market expansion</P></DIV>
</TIMELINE>
\`\`\`

7. PYRAMID: For hierarchical importance
\`\`\`xml
<PYRAMID>
  <DIV><H3>Vision</H3><P>Our aspirational goal</P></DIV>
  <DIV><H3>Strategy</H3><P>Key approaches to achieve vision</P></DIV>
  <DIV><H3>Tactics</H3><P>Specific implementation steps</P></DIV>
</PYRAMID>
\`\`\`

8. STAIRCASE: For progressive advancement
\`\`\`xml
<STAIRCASE>
  <DIV><H3>Basic</H3><P>Foundational capabilities</P></DIV>
  <DIV><H3>Advanced</H3><P>Enhanced features and benefits</P></DIV>
  <DIV><H3>Expert</H3><P>Premium capabilities and results</P></DIV>
</STAIRCASE>
\`\`\`

9. BOXES: For simple information tiles
\`\`\`xml
<BOXES>
  <DIV><H3>Speed</H3> <P>Faster delivery cycles.</P></DIV>
  <DIV><H3>Quality</H3> <P>Automated testing & reviews.</P></DIV>
  <DIV><H3>Security</H3> <P>Shift-left security practices.</P></DIV>
</BOXES>
\`\`\`

10. COMPARE: For side-by-side comparison
\`\`\`xml
<COMPARE>
  <DIV><H3>Solution A</H3> <LI>Features 1</LI> <LI>Features 2</LI></DIV>
  <DIV><H3>Solution B</H3> <LI>Features 3</LI> <LI>Features 4</LI></DIV>
</COMPARE>
\`\`\`

11. BEFORE-AFTER: For transformation snapshots
\`\`\`xml
<BEFORE-AFTER>
  <DIV><H3>Before</H3> <P>Manual processes, scattered data.</P></DIV>
  <DIV><H3>After</H3> <P>Automated workflows, unified insights.</P></DIV>
</BEFORE-AFTER>
\`\`\`

12. PROS-CONS: For trade-offs
\`\`\`xml
<PROS-CONS>
  <PROS><H3>Pros</H3> <LI>Pros 1</LI> <LI>Pros 2</LI></PROS>
  <CONS><H3>Cons</H3> <LI>Cons 1</LI> <LI>Cons 2</LI></CONS>
</PROS-CONS>
\`\`\`

13. TABLE: For tabular data. Preferred over other layouts for tabular data. It can also be used to do comparisons.
\`\`\`xml
<TABLE>
  <TR><TH>Header 1</TH><TH>Header 2</TH></TR>
  <TR><TD>Data 1</TD><TD>Data 2</TD></TR>
</TABLE>
\`\`\`

14. CHARTS: Use compact DATA rows (no TABLEs). The AI must emit \`<DATA>\` items inside \`<CHART>\`.
\`\`\`xml
<!-- Label/Value charts: bar, pie, line, area, radar -->
<CHART charttype="bar|pie|line|area|radar">
  <DATA><LABEL>Q1</LABEL><VALUE>24</VALUE></DATA>
  <DATA><LABEL>Q2</LABEL><VALUE>36</VALUE></DATA>
</CHART>

<!-- Scatter charts: provide numeric X and Y per DATA point -->
<CHART charttype="scatter">
  <DATA><X>1</X><Y>2</Y></DATA>
  <DATA><X>3</X><Y>5</Y></DATA>
</CHART>
\`\`\`


## CONTENT EXPANSION
For each outline point:
- Add supporting data/statistics
- Include real-world examples
- Reference industry trends
- Add thought-provoking questions
- Expand with detailed explanations

## CRITICAL RULES - MUST FOLLOW EXACTLY

**SLIDE COUNT REQUIREMENT (MOST IMPORTANT):**
- You MUST create EXACTLY {TOTAL_SLIDES} SECTION tags
- Count: 1, 2, 3... up to {TOTAL_SLIDES} ONLY
- DO NOT create more than {TOTAL_SLIDES} SECTION tags
- DO NOT create fewer than {TOTAL_SLIDES} SECTION tags
- If you create {TOTAL_SLIDES} = 2, create ONLY 2 sections, NOT 20 or 30!
- STOP after creating {TOTAL_SLIDES} sections

**OTHER RULES:**
1. NEVER repeat layouts in consecutive slides
2. DO NOT copy outline verbatim - expand and enhance with examples and data
3. Use appropriate heading hierarchy (H2 for slide titles, H3 for sections)
4. Focus on clear, informative content that adds value
5. Use only the XML tags shown above. Do not invent new tags or attributes
6. DO NOT include any <IMG> tags or image queries
7. Every SECTION must have substantial content (minimum 50 words per slide)
8. NO empty SECTION tags allowed

**IMPORTANT:** Stop generating immediately after creating {TOTAL_SLIDES} SECTION tags.

Now create a complete XML presentation with EXACTLY {TOTAL_SLIDES} slides (no more, no less):
`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      prompt: userPrompt,
      outline,
      language,
      tone,
      modelProvider = "bedrock",
      modelId,
      searchResults,
    } = (await req.json()) as SlidesRequest;

    if (!title || !outline || !Array.isArray(outline) || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Format search results
    let searchResultsText = "No research data available.";
    if (searchResults && searchResults.length > 0) {
      const searchData = searchResults
        .map((searchItem, index: number) => {
          const query = searchItem.query || `Search ${index + 1}`;
          const results = Array.isArray(searchItem.results)
            ? searchItem.results
            : [];

          if (results.length === 0) return "";

          const formattedResults = results
            .map((result: unknown) => {
              const resultObj = result as Record<string, unknown>;
              return `- ${resultObj.title || "No title"}\n  ${resultObj.content || "No content"}\n  ${resultObj.url || "No URL"}`;
            })
            .join("\n");

          return `**Search Query ${index + 1}:** ${query}\n**Results:**\n${formattedResults}\n---`;
        })
        .filter(Boolean)
        .join("\n\n");

      if (searchData) {
        searchResultsText = `The following research was conducted during outline generation:\n\n${searchData}`;
      }
    }

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Initialize model with error handling
    let model;
    try {
      model = modelPicker(modelProvider, modelId);
      console.log("✅ Model initialized successfully:", modelProvider, modelId || "default");
    } catch (modelError) {
      console.error("❌ Error initializing model:", modelError);
      const errorMessage =
        modelError instanceof Error ? modelError.message : "Unknown error";
      return NextResponse.json(
        {
          error: "Failed to initialize AI model",
          details: errorMessage,
        },
        { status: 500 },
      );
    }

    // Format the prompt with template variables
    const formattedPrompt = slidesTemplate
      .replace(/{TITLE}/g, title)
      .replace(/{PROMPT}/g, userPrompt || "No specific prompt provided")
      .replace(/{CURRENT_DATE}/g, currentDate)
      .replace(/{LANGUAGE}/g, language)
      .replace(/{TONE}/g, tone || "professional")
      .replace(/{OUTLINE_FORMATTED}/g, outline.join("\n\n"))
      .replace(/{TOTAL_SLIDES}/g, outline.length.toString())
      .replace(/{SEARCH_RESULTS}/g, searchResultsText);

    console.log("🚀 Starting presentation generation...");
    console.log("📝 Request details:", {
      title,
      outlineCount: outline.length,
      requestedSlides: outline.length,
      language,
      tone: tone || "professional",
      modelProvider,
      modelId: modelId || "default",
      promptLength: formattedPrompt.length,
    });
    console.log("⚠️ REQUESTED SLIDE COUNT:", outline.length, "- AI MUST create EXACTLY this many slides!");
    console.log("📄 Prompt preview (first 500 chars):", String(formattedPrompt).substring(0, 500));

    try {
      console.log("🔄 Starting streamText call...");
      
      const result = streamText({
        model,
        prompt: String(formattedPrompt),
        maxTokens: 4000, // Claude 3 Sonnet max output is 4096 tokens
        temperature: 0.7,
        onFinish: (finishResult) => {
          console.log("✅ Stream finished successfully!");
          
          // Count how many SECTION tags were actually generated
          const sectionCount = (finishResult.text?.match(/<SECTION/g) || []).length;
          console.log(`🎯 SLIDES GENERATED: ${sectionCount} (Expected: ${outline.length})`);
          
          if (sectionCount !== outline.length) {
            console.warn(`⚠️ WARNING: AI generated ${sectionCount} slides but ${outline.length} were requested!`);
          }
          
          console.log("📊 Finish details:", {
            finishReason: finishResult.finishReason,
            usage: finishResult.usage,
            responseLength: finishResult.text?.length || 0,
            slidesGenerated: sectionCount,
            slidesExpected: outline.length,
            hasError: finishResult.finishReason === "error",
          });
          
          if (finishResult.finishReason === "error") {
            console.error("❌ Stream finished with error");
          }
          
          // Log response preview
          if (finishResult.text) {
            console.log("📝 Response preview (first 2000 chars):", finishResult.text.substring(0, 2000));
            console.log("📝 Response preview (last 1000 chars):", finishResult.text.slice(-1000));
            console.log("📊 Total response length:", finishResult.text.length);
          }
        },
        onError: (errorResult) => {
          console.error("❌ Stream error occurred:", errorResult);
          const err = errorResult.error;
          if (err instanceof Error) {
            console.error("❌ Error details:", {
              message: err.message,
              stack: err.stack,
              name: err.name,
            });
          }
        },
      });

      // IMPORTANT: Don't consume the stream here - it needs to go to the client!
      // Consuming it with for-await will prevent the response from reaching the frontend
      console.log("📡 Converting to data stream response...");
      
      try {
        const streamResponse = result.toDataStreamResponse();
        console.log("✅ Data stream response created successfully");
        console.log("📊 Stream response headers:", Object.fromEntries(streamResponse.headers.entries()));
        console.log("🥊 Stream response status:", streamResponse.status, streamResponse.statusText);
        
        // Wrap the stream to catch errors and log data
        if (!streamResponse.body) {
          throw new Error("Stream response has no body");
        }
        
        // Use TransformStream to log without consuming the stream
        let chunkCount = 0;
        let totalBytes = 0;
        const decoder = new TextDecoder();
        let buffer = new Uint8Array(0);
        
        const loggedStream = new TransformStream({
          transform(chunk, controller) {
            chunkCount++;
            totalBytes += chunk.byteLength;
            
            // Combine with buffer for UTF-8 decoding
            const combined = new Uint8Array(buffer.length + chunk.byteLength);
            combined.set(buffer);
            combined.set(chunk, buffer.length);
            
            // Try to decode complete sequences
            try {
              const text = decoder.decode(combined, { stream: true });
              
              // Log first few chunks
              if (chunkCount <= 3) {
                console.log(`📦 Chunk ${chunkCount} (${chunk.byteLength} bytes):`, text.substring(0, 300));
              }
              
              // Check for error chunks
              if (text.includes('"type":"error"') || text.includes('"error"')) {
                console.error("❌ Error found in stream chunk:", text.substring(0, 500));
              }
              
              // Reset buffer if we successfully decoded
              buffer = new Uint8Array(0);
            } catch {
              // Keep buffer for next chunk if decoding fails (partial UTF-8 sequence)
              buffer = combined;
            }
            
            // Always forward the original chunk
            controller.enqueue(chunk);
          },
          
          flush(controller) {
            console.log(`✅ Stream completed. Total chunks: ${chunkCount}, Total bytes: ${totalBytes}`);
            controller.terminate();
          },
        });
        
        // Pipe the original stream through the logging stream
        const pipedStream = streamResponse.body.pipeThrough(loggedStream);
        
        return new Response(pipedStream, {
          headers: streamResponse.headers,
          status: streamResponse.status,
          statusText: streamResponse.statusText,
        });
      } catch (responseError) {
        console.error("❌ Error creating data stream response:", responseError);
        const errorDetails = {
          message: responseError instanceof Error ? responseError.message : "Unknown error",
          stack: responseError instanceof Error ? responseError.stack : undefined,
          name: responseError instanceof Error ? responseError.name : undefined,
        };
        console.error("❌ Full response error:", errorDetails);
        throw responseError;
      }
    } catch (streamError) {
      console.error("❌ Error creating/streaming text:", streamError);
      const errorMessage =
        streamError instanceof Error ? streamError.message : "Unknown error";
      console.error("❌ Full stream error details:", {
        message: errorMessage,
        stack: streamError instanceof Error ? streamError.stack : undefined,
        name: streamError instanceof Error ? streamError.name : undefined,
        error: streamError,
      });
      
      // Return a proper error response
      return NextResponse.json(
        {
          error: "Failed to generate presentation",
          message: errorMessage,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error in presentation generation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ Full error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to generate presentation slides",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
