export const runtime = 'edge';

export async function POST(request) {
  try {
    const formData = await request.formData();

    const brandName    = formData.get('brandName') || '';
    const brandProduct = formData.get('brandProduct') || '';
    const niche        = formData.get('niche') || '';
    const goal         = formData.get('goal') || '';
    const client       = formData.get('client') || '';
    const story        = formData.get('story') || '';
    const igHandle     = formData.get('igHandle') || '';
    const igMode       = formData.get('igMode') || '';
    const igBio        = formData.get('igBio') || '';
    const igCaps       = formData.get('igCaps') || '';
    const igVisual     = formData.get('igVisual') || '';
    const competitors  = formData.get('competitors') || '';
    const freq         = formData.get('freq') || '';
    const exec         = formData.get('exec') || '';
    const pain         = formData.get('pain') || '';
    const extra        = formData.get('extra') || '';

    const screenshotFiles = formData.getAll('screenshots');
    const imageContent = [];

    for (const file of screenshotFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
        imageContent.push({
          type: 'image',
          source: { type: 'base64', media_type: file.type, data: base64 }
        });
      }
    }

    const prompt = `Você é uma estrategista sênior de Instagram para negócios brasileiros. Analise os dados abaixo com profundidade e crie um MAPA ESTRATÉGICO COMPLETO, detalhado e 100% personalizado.

MARCA: ${brandName}
O QUE VENDE: ${brandProduct}
NICHO: ${niche}
OBJETIVO: ${goal}
CLIENTE IDEAL: ${client || 'não informado'}
HISTÓRIA / DIFERENCIAL: ${story || 'não informado'}

INSTAGRAM (${igHandle}):
Bio: ${igBio || 'ver imagens'}
Legendas: ${igCaps || 'ver imagens'}
Visual: ${igVisual || 'ver imagens'}
Método: ${igMode === 'ss' ? 'análise visual de screenshots' : 'descrição manual'}

CONCORRENTES/REFERÊNCIAS: ${competitors || 'não informado'}
FREQUÊNCIA ATUAL: ${freq || 'não informado'}
QUEM EXECUTA: ${exec || 'não informado'}
O QUE NÃO FUNCIONA: ${pain || 'não informado'}
EXTRA: ${extra || 'nenhum'}

Crie uma estratégia real, específica, acionável. Use o nome da marca. Seja honesto no diagnóstico.
Estruture as linhas editoriais com lógica de funil (topo/meio/fundo de funil).

Retorne APENAS JSON puro sem markdown:
{
  "diagnostico": "Diagnóstico do estado atual do Instagram. Seja honesto: o que está bom, o que está ruim, o que falta, como o visual se apresenta, que tipo de conteúdo domina, qual o engajamento aparente. Mínimo 200 palavras.",
  "posicionamento": "Como a marca deve se posicionar: proposta de valor, território de marca, tom de voz, diferencial competitivo, como deve ser percebida pelo cliente ideal. Mínimo 140 palavras.",
  "persona": "Perfil completo da persona: nome fictício, idade, profissão, rotina, dores, desejos, objeções de compra, onde consome conteúdo, como encontra marcas, o que a faz comprar. Mínimo 150 palavras.",
  "concorrencia": "Análise do cenário competitivo: o que os concorrentes fazem bem, onde erram, que oportunidades existem, como se diferenciar. Mínimo 110 palavras.",
  "linhasEditoriais": "5 pilares de conteúdo. Para cada um: NOME DO PILAR, descrição, posição no funil (topo/meio/fundo), objetivo, 3 exemplos concretos de posts. Formate cada pilar claramente. Mínimo 220 palavras.",
  "calendarioSugerido": "Calendário semanal detalhado: quantos posts por semana, que tipo de conteúdo em cada dia, horários recomendados, mix de formatos (reels/carrossel/foto/stories). Mínimo 100 palavras.",
  "ideiasDeConteudo": "12 ideias concretas de posts prontas para usar: título chamativo + formato recomendado (reels/carrossel/foto/stories) + objetivo de cada uma. Seja criativo e específico para esta marca.",
  "planoDeAcao": "3 ações prioritárias para os próximos 30 dias. Cada ação: O QUÊ fazer, POR QUÊ é prioritário, COMO executar passo a passo, QUEM é responsável, PRAZO. Mínimo 180 palavras."
}`;

    const messages = [{
      role: 'user',
      content: [...imageContent, { type: 'text', text: prompt }]
    }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return Response.json({ error: err.error?.message || 'Erro na API' }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const strategy = JSON.parse(clean);

    return Response.json({ strategy });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
