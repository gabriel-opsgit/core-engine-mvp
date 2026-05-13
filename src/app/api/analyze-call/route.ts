import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY não configurada");
      return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const { transcript, personaName, personaRole } = await req.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "Transcrição vazia" }, { status: 400 });
    }

    const prompt = `
      Você é um treinador de vendas B2B expert. Analise a seguinte transcrição de uma cold call entre um vendedor e o cliente ${personaName} (${personaRole}).
      
      TRANSCRIÇÃO:
      ${transcript}

      REGRAS:
      1. Seja crítico e honesto.
      2. Foque em: Rapport, Identificação de Dor, Pitch de Valor e Fechamento.
      3. Se a conversa foi curta demais ou sem sentido, reflita isso na nota baixa.
      
      RETORNE APENAS UM JSON NO SEGUINTE FORMATO:
      {
        "score": número de 0 a 100,
        "engagement": "Baixa" | "Média" | "Alta",
        "strengths": ["ponto 1", "ponto 2"],
        "weaknesses": ["ponto 1", "ponto 2"],
        "expertTip": "uma dica curta e acionável"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Analista B2B. Seja conciso." }, 
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500, // Limita o tamanho da resposta para ser mais rápido
      temperature: 0.5,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(analysis);

  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return NextResponse.json({ error: "Falha ao analisar a chamada" }, { status: 500 });
  }
}
