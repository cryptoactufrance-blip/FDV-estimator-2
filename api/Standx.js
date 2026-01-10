export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // Récupérer le volume depuis DeFiLlama
    const llamaUrl = 'https://api.llama.fi/summary/derivatives/standx?dataType=dailyVolume';
    
    const response = await fetch(llamaUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const data = await response.json();

    // Récupérer le volume des 7 derniers jours
    const totalDataChart = data.totalDataChart || [];
    const last7Days = totalDataChart.slice(-7);
    
    let volume7d = 0;
    let volume24h = 0;
    
    if (last7Days.length > 0) {
      volume7d = last7Days.reduce((sum, day) => sum + (day[1] || 0), 0);
      volume24h = last7Days[last7Days.length - 1]?.[1] || 0;
    }

    // Calculer les fees basés sur le volume
    // Maker fee: 0.01% = 0.0001
    // Taker fee: 0.04% = 0.0004
    // Estimation: 50% maker / 50% taker en moyenne
    const avgFeeRate = (0.0001 + 0.0004) / 2; // 0.025% = 0.00025
    
    const fees24h = volume24h * avgFeeRate;
    const fees7d = volume7d * avgFeeRate;

    // Retourner les données formatées comme les autres APIs
    const result = {
      protocol: 'standx',
      name: 'StandX',
      total24h: fees24h,
      total7d: fees7d,
      volume24h: volume24h,
      volume7d: volume7d,
      feeRate: avgFeeRate,
      makerFee: 0.0001,
      takerFee: 0.0004,
      logo: null, // Pas de logo disponible
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
        protocol: 'standx' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
