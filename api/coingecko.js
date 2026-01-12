export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coinId');

  if (!coinId) {
    return new Response(
      JSON.stringify({ error: 'Missing coinId parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const API_KEY = 'CG-QgrMAHBWtELivvPG367nTZU4';
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-cg-demo-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the relevant data
    const price = data.market_data?.current_price?.usd || 0;
    const totalSupply = data.market_data?.total_supply || 0;
    const maxSupply = data.market_data?.max_supply || 0;
    
    // Try to get FDV from API, otherwise calculate it from price * total_supply (or max_supply)
    let fdv = data.market_data?.fully_diluted_valuation?.usd || 0;
    
    // Fallback: calculate FDV if not provided but we have price and supply data
    if (fdv === 0 && price > 0) {
      const supplyForFDV = maxSupply || totalSupply;
      if (supplyForFDV > 0) {
        fdv = price * supplyForFDV;
      }
    }

    const result = {
      coinId: coinId,
      fdv: fdv,
      marketCap: data.market_data?.market_cap?.usd || 0,
      price: price,
      totalSupply: totalSupply,
      maxSupply: maxSupply,
      name: data.name || coinId,
      symbol: data.symbol || '',
      image: data.image?.small || null,
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
        coinId: coinId 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
