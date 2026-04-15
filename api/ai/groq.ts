import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * EduLaw AI Foundation (Powered by Groq Llama 3.1 70B)
 * This serverless function securely proxies all AI requests (Evaluation, Explanation, Scraping).
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, systemPrompt, temperature = 0.5, max_tokens = 2000 } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GROQ_API_KEY is not configured on the server. Please add it to Vercel Environment Variables.' 
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt || 'You are an expert Indian Legal Assistant helping students prepare for Judiciary and UPSC exams.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    return res.status(200).json({ 
      result: data.choices[0].message.content,
      usage: data.usage
    });
  } catch (error) {
    console.error('Groq Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
