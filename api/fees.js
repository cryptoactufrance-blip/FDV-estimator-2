export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const protocol = searchParams.get('protocol');

  if (!protocol) {
    return new Response(
      JSON.stringify({ error: 'Missing protocol parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const url = `https://api.llama.fi/summary/fees/${protocol}?dataType=dailyFees`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the relevant data
    const result = {
      protocol: protocol,
      total24h: data.total24h || 0,
      total7d: data.total7d || 0,
      total30d: data.total30d || 0,
      totalAllTime: data.totalAllTime || 0,
      logo: data.logo || null,
      name: data.name || protocol,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        protocol: protocol 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
