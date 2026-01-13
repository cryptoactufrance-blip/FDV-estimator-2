// API Edge Function pour mettre à jour les données dans Supabase
// S'exécute 1x par jour via Vercel Cron

export const config = {
    runtime: 'edge',
};

// Configuration des projets (même config que dans ton index.html)
const PROJECTS = {
    withToken: [
        { name: 'Hyperliquid', llamaSlug: 'hyperliquid-perps', coinGeckoId: 'hyperliquid', logo: 'https://icons.llamao.fi/icons/protocols/hyperliquid?w=48&h=48', url: 'https://app.hyperliquid.xyz/join/CRYPTOMAGE' },
        { name: 'GMX', llamaSlug: 'gmx', coinGeckoId: 'gmx', logo: 'https://icons.llamao.fi/icons/protocols/gmx?w=48&h=48', url: 'https://gmx.io/#/' },
        { name: 'dYdX', llamaSlug: 'dydx', coinGeckoId: 'dydx-chain', logo: 'https://icons.llamao.fi/icons/protocols/dydx?w=48&h=48', url: 'https://dydx.trade' },
        { name: 'Drift', llamaSlug: 'drift-protocol', coinGeckoId: 'drift-protocol', logo: 'https://icons.llamao.fi/icons/protocols/drift-protocol?w=48&h=48', url: 'https://www.drift.trade/' },
        { name: 'Orderly', llamaSlug: 'orderly-network', coinGeckoId: 'orderly-network', logo: 'https://icons.llamao.fi/icons/protocols/orderly-network?w=48&h=48', url: 'https://orderly.network' },
        { name: 'ApeX', llamaSlug: 'apex-protocol-omni', coinGeckoId: 'apex-protocol-2', logo: 'https://icons.llamao.fi/icons/protocols/apex-protocol-omni?w=48&h=48', url: 'https://www.apex.exchange/fr-FR' },
        { name: 'Avantis', llamaSlug: 'avantis', coinGeckoId: 'avantis', logo: 'https://icons.llamao.fi/icons/protocols/avantis?w=48&h=48', url: 'https://www.avantisfi.com/referral?code=cryptomage' },
        { name: 'Lighter', llamaSlug: 'lighter', coinGeckoContract: { platform: 'arbitrum-one', address: '0xe5edc9a1c478fd0e5068923118e2f1a9d52dcd4c' }, logo: 'https://icons.llamao.fi/icons/protocols/lighter?w=48&h=48', url: 'https://app.lighter.xyz/trade/LIT_USDC' },
        { name: 'Aster', llamaSlug: 'aster-dex', coinGeckoId: 'asterfi', logo: 'https://icons.llamao.fi/icons/protocols/aster-dex?w=48&h=48', url: 'https://www.asterdex.com/en/referral/081a02' },
        { name: 'Nado', llamaSlug: 'nado', coinGeckoContract: { platform: 'sonic', address: '0x0e84f0404f7c407e42766dd793ec0f4a8fb4b132' }, logo: 'https://icons.llamao.fi/icons/protocols/nado?w=48&h=48', url: 'https://www.nado.xyz' },
        { name: 'HyENA', llamaSlug: 'hyena', coinGeckoContract: { platform: 'hyperliquid', address: '0xfd01722b0ab17a946bc0a3c7e394e8b2ec7b5881' }, logo: 'https://icons.llamao.fi/icons/protocols/hyena?w=48&h=48', url: 'https://app.hyena.trade' },
    ],
    withoutToken: [
        { name: 'Extended', llamaSlug: 'extended', url: 'https://app.extended.exchange/join/CRYPTOMAGE', pointsSeasonStart: '2025-04-29', pointsMax: 70000000, pointsMaxInfo: 'Basé sur les annonces Discord hebdo + 1.2M points/semaine jusqu\'à fin Q2 26', airdropPct: 30, comment: 'Maker 0% / Taker 0.035%' },
        { name: 'Paradex', llamaSlug: 'paradex', url: 'https://app.paradex.trade/r/cryptomage', pointsSeasonStart: '2025-01-03', pointsMax: 310000000, pointsMaxInfo: '100M points S1 + 400k points/semaine S2, fin estimée 31 Jan 2026', airdropPct: 20, airdropPctInfo: '5% S1 + 15% S2 (source: Paradex Foundation)', comment: 'Arrive à la fin de la partie pre-TGE. Top pour faire du farming de fundings avec Variational.' },
        { name: 'EdgeX', llamaSlug: 'edgex', url: 'https://www.edgex.exchange/en-US', pointsSeasonStart: '2025-12-11', pointsMax: null, airdropPct: 25, comment: 'Perps Asiatique, pas beaucoup d\'info dessus' },
        { name: 'Ethereal', llamaSlug: 'ethereal-exchange', url: 'https://www.ethereal.trade/', pointsSeasonStart: '2025-07-01', pointsMax: null, airdropPct: null, comment: 'Top pour faire du DN, gros bonus de yield sur les positions longues durées.' },
        { name: 'Ostium', llamaSlug: 'ostium', url: 'https://ostium.app/trade?ref=JVCXY', pointsSeasonStart: '2025-03-31', pointsMax: 55000000, pointsMaxInfo: '30M points S1 (estimé) + 25M points S2 (hardcap)', airdropPct: null, comment: 'Vaut le coup uniquement pour le vault (bon rendement + points)' },
        { name: 'Vest', llamaSlug: 'vest-exchange', url: 'https://trade.vestmarkets.com/trade/NVDA-USD-PERP', pointsSeasonStart: '2024-07-01', pointsMax: null, airdropPct: 20, comment: 'Maker 0.02% / Taker 0.06%' },
        { name: 'Unit', llamaSlug: 'unit-hyperliquid', url: 'https://hyperunit.xyz/deposit', pointsSeasonStart: '2025-12-01', pointsMax: null, airdropPct: null, comment: 'Meilleur farm = rééquilibrage de LPs avec des assets Unit (BTC / ETH / SOL...)' },
        { name: 'tradeXYZ', llamaSlug: 'trade-xyz', url: 'https://app.trade.xyz/trade?market=XYZ100', pointsSeasonStart: null, pointsMax: null, airdropPct: null, comment: 'Mieux de trade ici que sur Hyperliquid, utilise HIP-3 et exactement les mêmes fonctionnalités, farm l\'Airdrop d\'Unit' },
        { name: 'Variational', llamaSlug: 'variational', customApi: 'variational', url: 'https://www.variational.io/', pointsSeasonStart: '2025-12-17', pointsMax: 9000000, pointsMaxInfo: 'Source : Données dispo dans la doc du projet', airdropPct: 25, comment: 'Relativement early. À utiliser pour la majorité de tes DN, récompense énormément les positions longues sur les paires avec peu d\'OI.' },
        { name: 'GRVT', llamaSlug: 'grvt', customApi: 'grvt', url: 'https://grvt.io', pointsSeasonStart: '2025-02-12', pointsMax: null, airdropPct: 10, comment: 'Maker -0.01% (rebate) / Taker 0.02%' },
        { name: 'Reya', llamaSlug: 'reya-network', url: 'https://reya.xyz', pointsSeasonStart: '2025-09-17', pointsMax: 150000000, pointsMaxInfo: '150M points sur tout le programme', airdropPct: 20, airdropPctInfo: '45% allocation communautaire, estimation à 20% pour l\'airdrop initial', comment: 'Maker 0% / Taker 0%' },
    ]
};

// Fonction pour récupérer les fees DeFiLlama
async function fetchDeFiLlamaFees(slug) {
    try {
        const response = await fetch(`https://api.llama.fi/summary/fees/${slug}?dataType=dailyFees`);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`DeFiLlama error for ${slug}:`, error);
        return null;
    }
}

// Fonction pour récupérer les données CoinGecko
async function fetchCoinGecko(coinId, contractInfo = null) {
    const apiKey = process.env.COINGECKO_API_KEY;
    try {
        let url;
        if (contractInfo) {
            url = `https://api.coingecko.com/api/v3/coins/${contractInfo.platform}/contract/${contractInfo.address}?x_cg_demo_api_key=${apiKey}`;
        } else {
            url = `https://api.coingecko.com/api/v3/coins/${coinId}?x_cg_demo_api_key=${apiKey}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        
        return {
            fdv: data.market_data?.fully_diluted_valuation?.usd || null,
            marketCap: data.market_data?.market_cap?.usd || null,
            price: data.market_data?.current_price?.usd || null,
            name: data.name
        };
    } catch (error) {
        console.error(`CoinGecko error for ${coinId}:`, error);
        return null;
    }
}

// Fonction pour récupérer les données Variational
async function fetchVariational() {
    try {
        const response = await fetch('https://api.variational.io/v2/stats');
        if (!response.ok) return null;
        const data = await response.json();
        
        const lossRefund24h = data.loss_refund_24h_usd || 0;
        return {
            total24h: lossRefund24h * 10,
            lossRefund24h: lossRefund24h
        };
    } catch (error) {
        console.error('Variational error:', error);
        return null;
    }
}

// Fonction pour récupérer les données GRVT
async function fetchGRVT() {
    try {
        const response = await fetch('https://market-data.grvt.io/full/v1/market_data_24hr');
        if (!response.ok) return null;
        const data = await response.json();
        
        let totalVolume = 0;
        if (data.result) {
            for (const market of data.result) {
                if (market.volume_24hr_base_value) {
                    const volume = parseFloat(market.volume_24hr_base_value);
                    const price = parseFloat(market.mark_price_value || 0);
                    totalVolume += (volume * price) / 1e18;
                }
            }
        }
        
        return {
            volume24h: totalVolume,
            total24h: totalVolume * 0.0002
        };
    } catch (error) {
        console.error('GRVT error:', error);
        return null;
    }
}

// Fonction principale pour collecter toutes les données
async function collectAllData() {
    const results = [];
    
    // Traiter les projets avec token
    for (const project of PROJECTS.withToken) {
        console.log(`Processing ${project.name}...`);
        
        // Récupérer les fees DeFiLlama
        const feesData = await fetchDeFiLlamaFees(project.llamaSlug);
        let fees7dAvg = 0;
        if (feesData?.totalDataChart) {
            const last7Days = feesData.totalDataChart.slice(-7);
            fees7dAvg = last7Days.reduce((sum, d) => sum + (d[1] || 0), 0) / 7;
        }
        
        // Récupérer les données CoinGecko
        const coinData = await fetchCoinGecko(project.coinGeckoId, project.coinGeckoContract);
        
        // Petite pause pour éviter le rate limiting
        await new Promise(r => setTimeout(r, 500));
        
        results.push({
            name: project.name,
            logo: project.logo,
            url: project.url,
            hasToken: true,
            fees7dAvg: fees7dAvg,
            annualRevenue: fees7dAvg * 365,
            fdv: coinData?.fdv || 0,
            marketCap: coinData?.marketCap || 0,
            ratio: coinData?.fdv && fees7dAvg ? coinData.fdv / (fees7dAvg * 365) : 0,
            fdvEstimated: false
        });
    }
    
    // Traiter les projets sans token
    for (const project of PROJECTS.withoutToken) {
        console.log(`Processing ${project.name}...`);
        
        let fees7dAvg = 0;
        let customApi = null;
        
        // API custom pour Variational
        if (project.customApi === 'variational') {
            const varData = await fetchVariational();
            if (varData) {
                fees7dAvg = varData.total24h;
                customApi = 'variational';
            }
        }
        // API custom pour GRVT
        else if (project.customApi === 'grvt') {
            const grvtData = await fetchGRVT();
            if (grvtData) {
                fees7dAvg = grvtData.total24h;
                customApi = 'grvt';
            }
        }
        // DeFiLlama standard
        else {
            const feesData = await fetchDeFiLlamaFees(project.llamaSlug);
            if (feesData?.totalDataChart) {
                const last7Days = feesData.totalDataChart.slice(-7);
                fees7dAvg = last7Days.reduce((sum, d) => sum + (d[1] || 0), 0) / 7;
            }
        }
        
        // Petite pause pour éviter le rate limiting
        await new Promise(r => setTimeout(r, 300));
        
        results.push({
            name: project.name,
            logo: `https://icons.llamao.fi/icons/protocols/${project.llamaSlug}?w=48&h=48`,
            url: project.url,
            hasToken: false,
            fees7dAvg: fees7dAvg,
            annualRevenue: fees7dAvg * 365,
            fdv: 0, // Sera calculé côté client avec le ratio
            ratio: 0,
            fdvEstimated: true,
            customApi: customApi,
            pointsSeasonStart: project.pointsSeasonStart,
            pointsMax: project.pointsMax,
            pointsMaxInfo: project.pointsMaxInfo,
            airdropPct: project.airdropPct,
            airdropPctInfo: project.airdropPctInfo,
            comment: project.comment
        });
    }
    
    return results;
}

// Fonction pour sauvegarder dans Supabase
async function saveToSupabase(data) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/projects_data?id=eq.1`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            data: data,
            updated_at: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase error: ${error}`);
    }
    
    return true;
}

// Handler principal
export default async function handler(request) {
    // Vérifier la méthode (accepter GET pour les tests et POST pour le cron)
    if (request.method !== 'GET' && request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Optionnel : vérifier un secret pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Si CRON_SECRET est défini, vérifier l'autorisation
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Permettre quand même l'accès sans auth pour les tests initiaux
        console.log('Warning: No valid authorization, but proceeding anyway');
    }
    
    try {
        console.log('Starting data collection...');
        
        // Collecter toutes les données
        const data = await collectAllData();
        
        console.log(`Collected data for ${data.length} projects`);
        
        // Sauvegarder dans Supabase
        await saveToSupabase(data);
        
        console.log('Data saved to Supabase successfully!');
        
        return new Response(JSON.stringify({
            success: true,
            message: `Updated ${data.length} projects`,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
