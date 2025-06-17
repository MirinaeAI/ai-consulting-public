import OpenAI from 'npm:openai@4.28.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    // 시스템 메시지 추가
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `당신은 AI 도구 추천 전문가입니다. 사용자의 요구사항을 파악하여 적절한 AI 도구를 추천해주세요.
      추천할 때는 다음 정보를 고려하세요:
      1. 사용자의 목적
      2. 조직 규모
      3. 예산
      4. 필요한 기능
      
      답변은 항상 친절하고 전문적으로 해주세요.`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const { data: tools } = await supabase
      .from('tools')
      .select(`
        id,
        name,
        description,
        url,
        price_min,
        price_max,
        is_free_tier,
        tool_categories (
          categories (
            name
          )
        )
      `);

    return new Response(
      JSON.stringify({
        message: completion.choices[0].message,
        tools: tools || [],
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});