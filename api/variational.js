export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const url = 'https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats';
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Variational API error: ${response.status}`);
    }

    const data = await response.json();

    // Calculer les fees : loss_refund.refunded_24h × 10
    const lossRefund24h = parseFloat(data.loss_refund?.refunded_24h || 0);
    const fees24h = lossRefund24h * 10;

    // Retourner les données formatées comme les autres APIs
    const result = {
      protocol: 'variational',
      name: 'Variational',
      total24h: fees24h,
      total7d: fees24h * 7, // Estimation basée sur 24h
      lossRefund24h: lossRefund24h,
      volume24h: parseFloat(data.total_volume_24h || 0),
      tvl: parseFloat(data.tvl || 0),
      openInterest: parseFloat(data.open_interest || 0),
      logo: 'https://docs.variational.io/~gitbook/image?url=https%3A%2F%2F3617648257-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FmoFQRSZ6KLfe4tnHIWRJ%252Ficon%252Fy0kCLYl2OqfeNRhEo8ik%252FVariational_Blue_Space-Blue-Mark-Space-Blue-Background.png%3Falt%3Dmedia%26token%3D9b45afca-d3b5-4ff7-92ed-be1f6bd8885a&width=64&dpr=2&quality=100&sign=bc19573b&sv=2',
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
        protocol: 'variational' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
