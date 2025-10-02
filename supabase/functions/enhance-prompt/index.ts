import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, promptType } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create system prompt based on prompt type
    const systemPrompts: Record<string, string> = {
      image: "You are an expert at enhancing image generation prompts. Transform the user's raw prompt into a detailed, structured JSON format optimized for image generation. Include: style, subject, lighting, composition, colors, mood, quality settings, and technical parameters.",
      video: "You are an expert at enhancing video generation prompts. Transform the user's raw prompt into a detailed, structured JSON format optimized for video generation. Include: scene description, camera movements, transitions, duration, style, mood, and technical parameters.",
      academic: "You are an expert at enhancing academic text prompts. Transform the user's raw prompt into a structured JSON format that includes: topic, scope, methodology, key concepts, structure outline, tone, and citation style.",
      casual: "You are an expert at enhancing casual queries. Transform the user's raw prompt into a friendly, structured JSON format that clarifies intent, context, and desired output format.",
      custom: "You are an expert at analyzing and enhancing prompts. Transform the user's raw prompt into a well-structured JSON format that best suits the prompt's intent.",
    };

    const systemPrompt = systemPrompts[promptType] || systemPrompts.custom;

    console.log("Enhancing prompt with type:", promptType);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt + "\n\nIMPORTANT: Respond with two parts:\n1. A JSON object with the enhanced prompt structure\n2. A comparison section explaining the improvements.\n\nFormat your response as:\n```json\n{enhanced JSON here}\n```\n\nCOMPARISON:\n{explanation of improvements}"
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response to extract JSON and comparison
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const comparisonMatch = content.match(/COMPARISON:\n([\s\S]*?)$/);

    let enhanced = {};
    let comparison = "";

    if (jsonMatch) {
      try {
        enhanced = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse enhanced JSON:", e);
        enhanced = { raw_response: content };
      }
    } else {
      // If no JSON block found, try to parse the whole content
      try {
        enhanced = JSON.parse(content);
      } catch (e) {
        enhanced = { raw_response: content };
      }
    }

    if (comparisonMatch) {
      comparison = comparisonMatch[1].trim();
    } else {
      comparison = "Enhanced prompt provides more structure and detail for better AI generation results.";
    }

    console.log("Successfully enhanced prompt");

    return new Response(
      JSON.stringify({ enhanced, comparison }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
