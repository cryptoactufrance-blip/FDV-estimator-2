export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // GRVT API - récupérer tous les instruments actifs
    const instrumentsUrl = 'https://market-data.grvt.io/full/v1/all_instruments';
    
    const instrumentsResponse = await fetch(instrumentsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: true }),
    });

    if (!instrumentsResponse.ok) {
      const errorText = await instrumentsResponse.text();
      throw new Error(`GRVT instruments API error: ${instrumentsResponse.status} - ${errorText}`);
    }

    const instrumentsData = await instrumentsResponse.json();
    const instruments = instrumentsData.result || [];
    
    if (instruments.length === 0) {
      throw new Error('No instruments returned from GRVT API');
    }

    // Récupérer le ticker pour chaque instrument et sommer les volumes
    let totalVolume24h = 0;
    let marketsCount = 0;
    let errors = [];

    for (const instrument of instruments) {
      try {
        const tickerUrl = 'https://market-data.grvt.io/full/v1/ticker';
        const tickerResponse = await fetch(tickerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instrument: instrument.instrument }),
        });

        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json();
          const ticker = tickerData.result;
          
          if (ticker) {
            // Volume 24h en quote currency (USDT) - buy + sell
            const buyVolume = parseFloat(ticker.buy_volume_24h_q || ticker.buy_volume_24h_b || 0);
            const sellVolume = parseFloat(ticker.sell_volume_24h_q || ticker.sell_volume_24h_b || 0);
            totalVolume24h += buyVolume + sellVolume;
            marketsCount++;
          }
        } else {
          errors.push(`${instrument.instrument}: ${tickerResponse.status}`);
        }
      } catch (e) {
        errors.push(`${instrument.instrument}: ${e.message}`);
      }
    }

    // Calculer les fees : volume × 0.02% (estimation moyenne)
    const feeRate = 0.0002; // 0.02%
    const fees24h = totalVolume24h * feeRate;

    // Retourner les données formatées
    const result = {
      protocol: 'grvt',
      name: 'GRVT',
      total24h: fees24h,
      total7d: fees24h * 7,
      volume24h: totalVolume24h,
      feeRate: feeRate,
      feeRatePercent: '0.02%',
      marketsCount: marketsCount,
      instrumentsTotal: instruments.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      logo: 'https://icons.llamao.fi/icons/protocols/grvt?w=48&h=48',
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
        protocol: 'grvt' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
