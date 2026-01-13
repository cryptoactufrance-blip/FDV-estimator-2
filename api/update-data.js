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
        { name: 'Drift', llamaSlug: 'drift-trade', coinGeckoId: 'drift-protocol', logo: 'https://icons.llamao.fi/icons/protocols/drift-trade?w=48&h=48', url: 'https://www.drift.trade/' },
        { name: 'Orderly', llamaSlug: 'orderly', coinGeckoId: 'orderly-network', logo: 'https://icons.llamao.fi/icons/protocols/orderly?w=48&h=48', url: 'https://orderly.network' },
        { name: 'ApeX', llamaSlug: 'apex-protocol', coinGeckoId: 'apex-token', logo: 'https://icons.llamao.fi/icons/protocols/apex-protocol?w=48&h=48', url: 'https://www.apex.exchange/fr-FR' },
        { name: 'Avantis', llamaSlug: 'avantis', coinGeckoId: 'avantis', logo: 'https://icons.llamao.fi/icons/protocols/avantis?w=48&h=48', url: 'https://www.avantisfi.com/referral?code=cryptomage' },
        { name: 'Lighter', llamaSlug: 'lighter', coinGeckoId: 'lighter', logo: 'https://icons.llamao.fi/icons/protocols/lighter?w=48&h=48', url: 'https://app.lighter.xyz/trade/LIT_USDC' },
        { name: 'Aster', llamaSlug: 'aster', coinGeckoId: 'aster-2', logo: 'https://icons.llamao.fi/icons/protocols/aster?w=48&h=48', url: 'https://www.asterdex.com/en/referral/081a02' },
    ],
    withoutToken: [
        { name: 'Extended', llamaSlug: 'extended', logo: 'https://icons.llamao.fi/icons/protocols/extended?w=48&h=48', url: 'https://app.extended.exchange/join/CRYPTOMAGE', pointsSeasonStart: '2025-04-29', pointsMax: 70000000, pointsMaxInfo: 'Basé sur les annonces Discord hebdo + 1.2M points/semaine jusqu\'à fin Q2 26', airdropPct: 30, comment: 'Maker 0% / Taker 0.035%' },
        { name: 'Paradex', llamaSlug: 'paradex', logo: 'https://icons.llamao.fi/icons/protocols/paradex?w=48&h=48', url: 'https://app.paradex.trade/r/cryptomage', pointsSeasonStart: '2025-01-03', pointsMax: 310000000, pointsMaxInfo: '100M points S1 + 400k points/semaine S2, fin estimée 31 Jan 2026', airdropPct: 20, airdropPctInfo: '5% S1 + 15% S2 (source: Paradex Foundation)', comment: 'Arrive à la fin de la partie pre-TGE. Top pour faire du farming de fundings avec Variational.' },
        { name: 'EdgeX', llamaSlug: 'edgex', logo: 'https://icons.llamao.fi/icons/protocols/edgex?w=48&h=48', url: 'https://www.edgex.exchange/en-US', pointsSeasonStart: '2025-12-11', pointsMax: null, airdropPct: 25, comment: 'Perps Asiatique, pas beaucoup d\'info dessus' },
        { name: 'Ethereal', llamaSlug: 'ethereal-dex', logo: 'https://icons.llamao.fi/icons/protocols/ethereal?w=48&h=48', url: 'https://www.ethereal.trade/', pointsSeasonStart: '2025-07-01', pointsMax: null, airdropPct: null, comment: 'Top pour faire du DN, gros bonus de yield sur les positions longues durées.' },
        { name: 'Ostium', llamaSlug: 'ostium', logo: 'https://icons.llamao.fi/icons/protocols/ostium?w=48&h=48', url: 'https://ostium.app/trade?ref=JVCXY', pointsSeasonStart: '2025-03-31', pointsMax: 55000000, pointsMaxInfo: '30M points S1 (estimé) + 25M points S2 (hardcap)', airdropPct: null, comment: 'Vaut le coup uniquement pour le vault (bon rendement + points)' },
        { name: 'Vest', llamaSlug: 'vest-exchange', logo: 'https://icons.llamao.fi/icons/protocols/vest-exchange?w=48&h=48', url: 'https://trade.vestmarkets.com/trade/NVDA-USD-PERP', pointsSeasonStart: '2024-07-01', pointsMax: null, airdropPct: 20, comment: 'Maker 0.02% / Taker 0.06%' },
        { name: 'Unit', llamaSlug: 'unit', logo: 'https://icons.llamao.fi/icons/protocols/unit?w=48&h=48', url: 'https://hyperunit.xyz/deposit', pointsSeasonStart: '2025-12-01', pointsMax: null, airdropPct: null, comment: 'Meilleur farm = rééquilibrage de LPs avec des assets Unit (BTC / ETH / SOL...)' },
        { name: 'tradeXYZ', llamaSlug: 'trade-xyz', logo: 'https://icons.llamao.fi/icons/protocols/trade-xyz?w=48&h=48', url: 'https://app.trade.xyz/trade?market=XYZ100', pointsSeasonStart: null, pointsMax: null, airdropPct: null, comment: 'Mieux de trade ici que sur Hyperliquid, utilise HIP-3 et exactement les mêmes fonctionnalités, farm l\'Airdrop d\'Unit' },
        { name: 'Variational', llamaSlug: 'variational', logo: 'https://icons.llamao.fi/icons/protocols/variational?w=48&h=48', customApi: 'variational', url: 'https://www.variational.io/', pointsSeasonStart: '2025-12-17', pointsMax: 9000000, pointsMaxInfo: 'Source : Données dispo dans la doc du projet', airdropPct: 25, comment: 'Relativement early. À utiliser pour la majorité de tes DN, récompense énormément les positions longues sur les paires avec peu d\'OI.' },
        { name: 'GRVT', llamaSlug: 'grvt', logo: 'https://icons.llamao.fi/icons/protocols/grvt?w=48&h=48', customApi: 'grvt', url: 'https://grvt.io', pointsSeasonStart: '2025-02-12', pointsMax: null, airdropPct: 10, comment: 'Maker -0.01% (rebate) / Taker 0.02%' },
        { name: 'Reya', llamaSlug: 'reya', logo: 'https://icons.llamao.fi/icons/protocols/reya?w=48&h=48', url: 'https://reya.xyz', pointsSeasonStart: '2025-09-17', pointsMax: 150000000, pointsMaxInfo: '150M points sur tout le programme', airdropPct: 20, airdropPctInfo: '45% allocation communautaire, estimation à 20% pour l\'airdrop initial', comment: 'Maker 0% / Taker 0%' },
        { name: 'Nado', llamaSlug: 'nado', logo: 'https://icons.llamao.fi/icons/protocols/nado?w=48&h=48', url: 'https://www.nado.xyz', pointsSeasonStart: null, pointsMax: null, airdropPct: null, comment: '' },
        { name: 'HyENA', llamaSlug: 'hyena', logo: 'https://icons.llamao.fi/icons/protocols/hyena?w=48&h=48', url: 'https://app.hyena.trade', pointsSeasonStart: null, pointsMax: null, airdropPct: null, comment: '' },
    ]
};

// Fonction pour récupérer les fees DeFiLlama
async function fetchDeFiLlamaFees(slug) {
    try {
        const response = await fetch(`https://api.llama.fi/summary/fees/${slug}?dataType=dailyFees`);
        if (!response.ok) {
            console.error(`DeFiLlama HTTP error for ${slug}: ${response.status}`);
            return null;
        }
        const data = await response.json();
        console.log(`DeFiLlama ${slug}: total24h=${data.total24h}, hasChart=${!!data.totalDataChart}, chartLength=${data.totalDataChart?.length || 0}`);
        return data;
    } catch (error) {
        console.error(`DeFiLlama error for ${slug}:`, error);
        return null;
    }
}

// Fonction helper pour extraire les fees moyennes sur 7 jours
function extractFees7dAvg(feesData) {
    // Méthode 1: Utiliser totalDataChart (tableau de [timestamp, value])
    if (feesData?.totalDataChart && feesData.totalDataChart.length > 0) {
        const last7Days = feesData.totalDataChart.slice(-7);
        const avg = last7Days.reduce((sum, d) => sum + (d[1] || 0), 0) / Math.min(7, last7Days.length);
        if (avg > 0) return avg;
    }
    
    // Méthode 2: Utiliser total24h directement
    if (feesData?.total24h && feesData.total24h > 0) {
        return feesData.total24h;
    }
    
    // Méthode 3: Utiliser total7d divisé par 7
    if (feesData?.total7d && feesData.total7d > 0) {
        return feesData.total7d / 7;
    }
    
    return 0;
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
        // URL correcte de l'API Variational
        const response = await fetch('https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats', {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.error(`Variational API error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        
        // Structure correcte : loss_refund.refunded_24h
        const lossRefund24h = parseFloat(data.loss_refund?.refunded_24h || 0);
        const fees24h = lossRefund24h * 10;
        
        console.log(`Variational: lossRefund24h=${lossRefund24h}, fees24h=${fees24h}`);
        
        return {
            total24h: fees24h,
            total7d: fees24h * 7,
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
        const tickerUrl = 'https://market-data.grvt.io/full/v1/ticker';
        
        // Récupérer tous les instruments actifs
        const instrumentsUrl = 'https://market-data.grvt.io/full/v1/all_instruments';
        const instrumentsResponse = await fetch(instrumentsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ is_active: true }),
        });

        if (!instrumentsResponse.ok) {
            console.error(`GRVT instruments error: ${instrumentsResponse.status}`);
            return null;
        }

        const instrumentsData = await instrumentsResponse.json();
        const instruments = instrumentsData.result || [];
        
        if (instruments.length === 0) {
            console.error('GRVT: No instruments returned');
            return null;
        }

        // Récupérer le ticker pour chaque instrument (limiter à 20 pour éviter timeout)
        let totalVolume24h = 0;
        let marketsCount = 0;
        const limitedInstruments = instruments.slice(0, 20);

        for (const instrument of limitedInstruments) {
            try {
                const tickerResponse = await fetch(tickerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ instrument: instrument.instrument }),
                });

                if (tickerResponse.ok) {
                    const tickerData = await tickerResponse.json();
                    const ticker = tickerData.result;
                    
                    if (ticker) {
                        // Volume 24h en quote currency (USDT)
                        const buyVolumeQ = parseFloat(ticker.buy_volume_24h_q || 0);
                        const sellVolumeQ = parseFloat(ticker.sell_volume_24h_q || 0);
                        totalVolume24h += buyVolumeQ + sellVolumeQ;
                        marketsCount++;
                    }
                }
            } catch (e) {
                // Ignorer les erreurs individuelles
            }
        }

        // Calculer les fees : volume × 0.02%
        const feeRate = 0.0002;
        const fees24h = totalVolume24h * feeRate;
        
        console.log(`GRVT: volume24h=${totalVolume24h}, fees24h=${fees24h}, markets=${marketsCount}`);

        return {
            volume24h: totalVolume24h,
            total24h: fees24h,
            total7d: fees24h * 7
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
        const fees7dAvg = extractFees7dAvg(feesData);
        console.log(`  -> ${project.name} fees7dAvg: ${fees7dAvg}`);
        
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
        let customApi = project.customApi || null; // Garder le flag original
        
        // API custom pour Variational
        if (project.customApi === 'variational') {
            console.log(`  -> Using Variational custom API`);
            const varData = await fetchVariational();
            if (varData && varData.total24h > 0) {
                fees7dAvg = varData.total24h;
                console.log(`  -> Variational fees: ${varData.total24h}`);
            } else {
                console.log(`  -> Variational API failed or returned 0`);
            }
        }
        // API custom pour GRVT
        else if (project.customApi === 'grvt') {
            console.log(`  -> Using GRVT custom API`);
            const grvtData = await fetchGRVT();
            if (grvtData && grvtData.total24h > 0) {
                fees7dAvg = grvtData.total24h;
                console.log(`  -> GRVT fees: ${grvtData.total24h}`);
            } else {
                console.log(`  -> GRVT API failed or returned 0`);
            }
        }
        // DeFiLlama standard
        else {
            console.log(`  -> Using DeFiLlama API for ${project.llamaSlug}`);
            const feesData = await fetchDeFiLlamaFees(project.llamaSlug);
            fees7dAvg = extractFees7dAvg(feesData);
            console.log(`  -> ${project.name} fees7dAvg: ${fees7dAvg}`);
        }
        
        // Petite pause pour éviter le rate limiting
        await new Promise(r => setTimeout(r, 300));
        
        results.push({
            name: project.name,
            logo: project.logo || `https://icons.llamao.fi/icons/protocols/${project.llamaSlug}?w=48&h=48`,
            url: project.url,
            hasToken: false,
            fees7dAvg: fees7dAvg,
            annualRevenue: fees7dAvg * 365,
            fdv: 0, // Sera calculé côté client avec le ratio
            ratio: 0,
            fdvEstimated: true,
            customApi: customApi, // Toujours garder le flag original
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
