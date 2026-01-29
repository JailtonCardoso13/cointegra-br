import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Star, Search, Filter, Calculator, BarChart3, Activity, RefreshCw, Wifi, WifiOff, Clock, AlertTriangle, Settings } from 'lucide-react';

// ============================================================
// CONFIGURAÇÃO DA API BRAPI
// ============================================================
// Para usar a Brapi, você precisa de uma API Key gratuita
// Cadastre-se em: https://brapi.dev/
// ============================================================

const BRAPI_CONFIG = {
  // Coloque sua API Key aqui (obtenha grátis em brapi.dev)
  API_KEY: 'oPE4GbcLs52ESDqgb6XeEr',
  BASE_URL: 'https://brapi.dev/api',
  
  // 94 Pares pré-definidos para análise de cointegração (setores correlacionados)
  // Organizados por setor para maior probabilidade de cointegração
  ANALYSIS_PAIRS: [
    // ==================== BANCOS (12 pares) ====================
    { asset1: 'ITUB4', asset2: 'BBDC4', sector: 'Bancos' },
    { asset1: 'BBAS3', asset2: 'ITUB4', sector: 'Bancos' },
    { asset1: 'SANB11', asset2: 'BBDC4', sector: 'Bancos' },
    { asset1: 'BBAS3', asset2: 'BBDC4', sector: 'Bancos' },
    { asset1: 'ITUB4', asset2: 'SANB11', sector: 'Bancos' },
    { asset1: 'BBAS3', asset2: 'SANB11', sector: 'Bancos' },
    { asset1: 'ITUB3', asset2: 'ITUB4', sector: 'Bancos' },
    { asset1: 'BBDC3', asset2: 'BBDC4', sector: 'Bancos' },
    { asset1: 'BPAC11', asset2: 'ITUB4', sector: 'Bancos' },
    { asset1: 'BPAC11', asset2: 'BBDC4', sector: 'Bancos' },
    { asset1: 'ABCB4', asset2: 'BPAC11', sector: 'Bancos' },
    { asset1: 'BRSR6', asset2: 'BBAS3', sector: 'Bancos' },
    
    // ==================== PETRÓLEO E GÁS (10 pares) ====================
    { asset1: 'PETR4', asset2: 'PRIO3', sector: 'Petróleo' },
    { asset1: 'PETR3', asset2: 'PETR4', sector: 'Petróleo' },
    { asset1: 'RRRP3', asset2: 'PRIO3', sector: 'Petróleo' },
    { asset1: 'PETR4', asset2: 'RRRP3', sector: 'Petróleo' },
    { asset1: 'RECV3', asset2: 'PRIO3', sector: 'Petróleo' },
    { asset1: 'RECV3', asset2: 'RRRP3', sector: 'Petróleo' },
    { asset1: 'CSAN3', asset2: 'UGPA3', sector: 'Combustíveis' },
    { asset1: 'VBBR3', asset2: 'UGPA3', sector: 'Combustíveis' },
    { asset1: 'CSAN3', asset2: 'VBBR3', sector: 'Combustíveis' },
    { asset1: 'PETR4', asset2: 'CSAN3', sector: 'Petróleo' },
    
    // ==================== MINERAÇÃO E SIDERURGIA (8 pares) ====================
    { asset1: 'VALE3', asset2: 'CSNA3', sector: 'Mineração' },
    { asset1: 'GGBR4', asset2: 'CSNA3', sector: 'Siderurgia' },
    { asset1: 'USIM5', asset2: 'GGBR4', sector: 'Siderurgia' },
    { asset1: 'VALE3', asset2: 'GGBR4', sector: 'Mineração' },
    { asset1: 'USIM5', asset2: 'CSNA3', sector: 'Siderurgia' },
    { asset1: 'GOAU4', asset2: 'GGBR4', sector: 'Siderurgia' },
    { asset1: 'CMIN3', asset2: 'VALE3', sector: 'Mineração' },
    { asset1: 'FESA4', asset2: 'GOAU4', sector: 'Siderurgia' },
    
    // ==================== ENERGIA ELÉTRICA (10 pares) ====================
    { asset1: 'ELET3', asset2: 'ELET6', sector: 'Energia' },
    { asset1: 'EGIE3', asset2: 'ELET3', sector: 'Energia' },
    { asset1: 'TAEE11', asset2: 'TRPL4', sector: 'Transmissão' },
    { asset1: 'CMIG4', asset2: 'CPFE3', sector: 'Energia' },
    { asset1: 'CMIG3', asset2: 'CMIG4', sector: 'Energia' },
    { asset1: 'ENGI11', asset2: 'EGIE3', sector: 'Energia' },
    { asset1: 'CPLE6', asset2: 'CMIG4', sector: 'Energia' },
    { asset1: 'AURE3', asset2: 'EGIE3', sector: 'Energia' },
    { asset1: 'AESB3', asset2: 'CMIG4', sector: 'Energia' },
    { asset1: 'NEOE3', asset2: 'CPFE3', sector: 'Energia' },
    
    // ==================== VAREJO (8 pares) ====================
    { asset1: 'MGLU3', asset2: 'VIIA3', sector: 'Varejo' },
    { asset1: 'LREN3', asset2: 'ARZZ3', sector: 'Varejo Moda' },
    { asset1: 'PETZ3', asset2: 'MGLU3', sector: 'Varejo' },
    { asset1: 'SOMA3', asset2: 'ARZZ3', sector: 'Varejo Moda' },
    { asset1: 'SOMA3', asset2: 'LREN3', sector: 'Varejo Moda' },
    { asset1: 'CEAB3', asset2: 'LREN3', sector: 'Varejo Moda' },
    { asset1: 'GUAR3', asset2: 'LREN3', sector: 'Varejo Moda' },
    { asset1: 'ALPA4', asset2: 'SOMA3', sector: 'Varejo Moda' },
    
    // ==================== FRIGORÍFICOS E ALIMENTOS (8 pares) ====================
    { asset1: 'BRFS3', asset2: 'JBSS3', sector: 'Frigoríficos' },
    { asset1: 'MRFG3', asset2: 'JBSS3', sector: 'Frigoríficos' },
    { asset1: 'BEEF3', asset2: 'MRFG3', sector: 'Frigoríficos' },
    { asset1: 'BRFS3', asset2: 'MRFG3', sector: 'Frigoríficos' },
    { asset1: 'ABEV3', asset2: 'MDIA3', sector: 'Alimentos' },
    { asset1: 'NTCO3', asset2: 'ABEV3', sector: 'Consumo' },
    { asset1: 'SMTO3', asset2: 'RAIZ4', sector: 'Açúcar/Etanol' },
    { asset1: 'CAML3', asset2: 'SLCE3', sector: 'Agro' },
    
    // ==================== SAÚDE (6 pares) ====================
    { asset1: 'HAPV3', asset2: 'RDOR3', sector: 'Saúde' },
    { asset1: 'FLRY3', asset2: 'RDOR3', sector: 'Saúde' },
    { asset1: 'QUAL3', asset2: 'HAPV3', sector: 'Saúde' },
    { asset1: 'ONCO3', asset2: 'FLRY3', sector: 'Saúde' },
    { asset1: 'DASA3', asset2: 'FLRY3', sector: 'Saúde' },
    { asset1: 'HYPE3', asset2: 'RADL3', sector: 'Farmacêutico' },
    
    // ==================== CONSTRUÇÃO E IMOBILIÁRIO (8 pares) ====================
    { asset1: 'CYRE3', asset2: 'EZTC3', sector: 'Construção' },
    { asset1: 'MRVE3', asset2: 'CYRE3', sector: 'Construção' },
    { asset1: 'EVEN3', asset2: 'EZTC3', sector: 'Construção' },
    { asset1: 'DIRR3', asset2: 'CYRE3', sector: 'Construção' },
    { asset1: 'TRIS3', asset2: 'MRVE3', sector: 'Construção' },
    { asset1: 'LAVV3', asset2: 'CYRE3', sector: 'Construção' },
    { asset1: 'CURY3', asset2: 'MRVE3', sector: 'Construção' },
    { asset1: 'PLPL3', asset2: 'EZTC3', sector: 'Construção' },
    
    // ==================== SEGUROS E FINANCEIRAS (5 pares) ====================
    { asset1: 'BBSE3', asset2: 'SULA11', sector: 'Seguros' },
    { asset1: 'PSSA3', asset2: 'BBSE3', sector: 'Seguros' },
    { asset1: 'CXSE3', asset2: 'BBSE3', sector: 'Seguros' },
    { asset1: 'B3SA3', asset2: 'CIEL3', sector: 'Financeiro' },
    { asset1: 'WIZC3', asset2: 'SULA11', sector: 'Seguros' },
    
    // ==================== PAPEL E CELULOSE (3 pares) ====================
    { asset1: 'SUZB3', asset2: 'KLBN11', sector: 'Papel/Celulose' },
    { asset1: 'KLBN4', asset2: 'KLBN11', sector: 'Papel/Celulose' },
    { asset1: 'SUZB3', asset2: 'KLBN4', sector: 'Papel/Celulose' },
    
    // ==================== SHOPPINGS E PROPRIEDADES (4 pares) ====================
    { asset1: 'MULT3', asset2: 'IGTI11', sector: 'Shoppings' },
    { asset1: 'BRML3', asset2: 'MULT3', sector: 'Shoppings' },
    { asset1: 'ALSO3', asset2: 'IGTI11', sector: 'Shoppings' },
    { asset1: 'JHSF3', asset2: 'MULT3', sector: 'Shoppings' },
    
    // ==================== TELECOM E TECNOLOGIA (4 pares) ====================
    { asset1: 'VIVT3', asset2: 'TIMS3', sector: 'Telecom' },
    { asset1: 'TOTVS3', asset2: 'LWSA3', sector: 'Tecnologia' },
    { asset1: 'CASH3', asset2: 'PAGS34', sector: 'Fintech' },
    { asset1: 'INTB3', asset2: 'TOTVS3', sector: 'Tecnologia' },
    
    // ==================== TRANSPORTE E LOGÍSTICA (5 pares) ====================
    { asset1: 'RAIL3', asset2: 'CCRO3', sector: 'Logística' },
    { asset1: 'ECOR3', asset2: 'CCRO3', sector: 'Concessões' },
    { asset1: 'HBSA3', asset2: 'RAIL3', sector: 'Logística' },
    { asset1: 'GOLL4', asset2: 'AZUL4', sector: 'Aéreas' },
    { asset1: 'EMBR3', asset2: 'AZUL4', sector: 'Aviação' },
    
    // ==================== SANEAMENTO (3 pares) ====================
    { asset1: 'SBSP3', asset2: 'CSMG3', sector: 'Saneamento' },
    { asset1: 'SAPR11', asset2: 'SBSP3', sector: 'Saneamento' },
    { asset1: 'CSMG3', asset2: 'SAPR11', sector: 'Saneamento' },
  ],
  
  // Configurações para Swing Trade
  SWING_TRADE: {
    MIN_DAYS_HISTORY: 120,  // Mínimo de dias para análise
    MIN_COMMON_DATES: 30,   // Mínimo de datas em comum entre os ativos
    LOOKBACK_PERIOD: 90,    // Período para cálculo de cointegração
    HALF_LIFE_MAX: 30,      // Máximo de dias aceitável para half-life
    HALF_LIFE_IDEAL: 15,    // Half-life ideal para swing trade
    UPDATE_INTERVAL: 300000, // Atualizar a cada 5 minutos (em ms)
  }
};

// ============================================================
// FUNÇÕES ESTATÍSTICAS PARA COINTEGRAÇÃO
// ============================================================

// Calcular média
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// Calcular desvio padrão
const stdDev = (arr) => {
  const avg = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / arr.length);
};

// Calcular correlação de Pearson
const correlation = (arr1, arr2) => {
  const n = Math.min(arr1.length, arr2.length);
  const mean1 = mean(arr1.slice(0, n));
  const mean2 = mean(arr2.slice(0, n));
  
  let num = 0, den1 = 0, den2 = 0;
  for (let i = 0; i < n; i++) {
    const diff1 = arr1[i] - mean1;
    const diff2 = arr2[i] - mean2;
    num += diff1 * diff2;
    den1 += diff1 * diff1;
    den2 += diff2 * diff2;
  }
  
  return num / Math.sqrt(den1 * den2);
};

// Regressão linear simples (retorna alpha, beta, residuos)
const linearRegression = (x, y) => {
  const n = Math.min(x.length, y.length);
  const meanX = mean(x.slice(0, n));
  const meanY = mean(y.slice(0, n));
  
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    den += (x[i] - meanX) * (x[i] - meanX);
  }
  
  const beta = num / den;
  const alpha = meanY - beta * meanX;
  
  // Calcular resíduos (spread)
  const residuals = [];
  for (let i = 0; i < n; i++) {
    residuals.push(y[i] - (alpha + beta * x[i]));
  }
  
  return { alpha, beta, residuals };
};

// Teste ADF simplificado (Augmented Dickey-Fuller)
// Retorna estatística t e p-value aproximado
const adfTest = (series) => {
  const n = series.length;
  if (n < 20) return { tStat: 0, pValue: 1 };
  
  // Calcular diferenças
  const diffs = [];
  const lagged = [];
  for (let i = 1; i < n; i++) {
    diffs.push(series[i] - series[i-1]);
    lagged.push(series[i-1]);
  }
  
  // Regressão: diff = alpha + beta * lagged + erro
  const reg = linearRegression(lagged, diffs);
  
  // Calcular estatística t para beta
  const residuals = reg.residuals;
  const sse = residuals.reduce((sum, r) => sum + r * r, 0);
  const mse = sse / (n - 3);
  
  const laggedMean = mean(lagged);
  const laggedVar = lagged.reduce((sum, x) => sum + Math.pow(x - laggedMean, 2), 0);
  const seBeta = Math.sqrt(mse / laggedVar);
  
  const tStat = reg.beta / seBeta;
  
  // P-value aproximado baseado em valores críticos do teste ADF
  // Valores críticos aproximados: 1%: -3.43, 5%: -2.86, 10%: -2.57
  let pValue;
  if (tStat < -3.43) pValue = 0.01;
  else if (tStat < -2.86) pValue = 0.05;
  else if (tStat < -2.57) pValue = 0.10;
  else if (tStat < -1.94) pValue = 0.20;
  else pValue = 0.50;
  
  return { tStat, pValue };
};

// Calcular Half-Life da reversão à média
const calculateHalfLife = (spread) => {
  const n = spread.length;
  if (n < 10) return 30;
  
  const lagged = spread.slice(0, -1);
  const current = spread.slice(1);
  const diffs = current.map((c, i) => c - lagged[i]);
  
  const reg = linearRegression(lagged, diffs);
  
  // Half-life = -ln(2) / ln(1 + beta)
  // Se beta >= 0, não há reversão à média
  if (reg.beta >= 0) return 999;
  
  const halfLife = -Math.log(2) / Math.log(1 + reg.beta);
  return Math.max(1, Math.min(999, Math.round(halfLife)));
};

// ============================================================
// SERVIÇO DE DADOS DA BRAPI
// ============================================================

// Dados simulados realistas para quando a API não está disponível (CORS/CSP)
const generateRealisticMockData = (ticker) => {
  // Preços base realistas por ticker
  const basePrices = {
    'ITUB4': 32, 'BBDC4': 12, 'BBAS3': 28, 'SANB11': 27, 'ITUB3': 32, 'BBDC3': 13,
    'BPAC11': 32, 'ABCB4': 21, 'BRSR6': 12,
    'PETR4': 38, 'PETR3': 40, 'PRIO3': 45, 'RRRP3': 28, 'RECV3': 18,
    'CSAN3': 13, 'UGPA3': 25, 'VBBR3': 22,
    'VALE3': 62, 'CSNA3': 12, 'GGBR4': 18, 'USIM5': 7, 'GOAU4': 10, 'CMIN3': 5, 'FESA4': 8,
    'ELET3': 42, 'ELET6': 45, 'EGIE3': 42, 'TAEE11': 35, 'TRPL4': 25, 'CMIG4': 12,
    'CMIG3': 15, 'ENGI11': 45, 'CPLE6': 10, 'CPFE3': 35, 'AURE3': 12, 'AESB3': 10, 'NEOE3': 18,
    'MGLU3': 12, 'VIIA3': 1.5, 'LREN3': 18, 'ARZZ3': 65, 'PETZ3': 4, 'SOMA3': 7,
    'CEAB3': 12, 'GUAR3': 7, 'ALPA4': 8,
    'BRFS3': 22, 'JBSS3': 35, 'MRFG3': 14, 'BEEF3': 6, 'ABEV3': 12, 'MDIA3': 28,
    'NTCO3': 15, 'SMTO3': 25, 'RAIZ4': 3, 'CAML3': 9, 'SLCE3': 18,
    'HAPV3': 4, 'RDOR3': 28, 'FLRY3': 15, 'QUAL3': 2, 'ONCO3': 12, 'DASA3': 10,
    'HYPE3': 32, 'RADL3': 25,
    'CYRE3': 22, 'EZTC3': 15, 'MRVE3': 8, 'EVEN3': 7, 'DIRR3': 18, 'TRIS3': 4,
    'LAVV3': 5, 'CURY3': 18, 'PLPL3': 2,
    'BBSE3': 35, 'SULA11': 22, 'PSSA3': 30, 'CXSE3': 12, 'B3SA3': 12, 'CIEL3': 5, 'WIZC3': 6,
    'SUZB3': 55, 'KLBN11': 22, 'KLBN4': 4,
    'MULT3': 25, 'IGTI11': 22, 'BRML3': 8, 'ALSO3': 22, 'JHSF3': 5,
    'VIVT3': 52, 'TIMS3': 16, 'TOTVS3': 28, 'LWSA3': 5, 'CASH3': 12, 'PAGS34': 20, 'INTB3': 18,
    'RAIL3': 22, 'CCRO3': 13, 'ECOR3': 7, 'HBSA3': 4, 'GOLL4': 1.5, 'AZUL4': 5, 'EMBR3': 55,
    'SBSP3': 92, 'CSMG3': 22, 'SAPR11': 25
  };
  
  const basePrice = basePrices[ticker] || 20 + Math.random() * 30;
  const volatility = 0.02 + Math.random() * 0.02; // 2-4% volatilidade diária
  const trend = (Math.random() - 0.5) * 0.001; // Pequena tendência
  
  const historicalData = [];
  let price = basePrice * (0.9 + Math.random() * 0.2); // Começa com variação de ±10%
  
  // Gerar 120 dias de dados
  const now = Date.now();
  for (let i = 119; i >= 0; i--) {
    const date = Math.floor((now - i * 86400000) / 1000);
    
    // Random walk com tendência
    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    price = price * (1 + change);
    price = Math.max(price, basePrice * 0.5); // Evitar preços muito baixos
    
    historicalData.push({
      date,
      open: price * (1 + (Math.random() - 0.5) * 0.01),
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.02),
      close: price,
      volume: Math.floor(1000000 + Math.random() * 5000000)
    });
  }
  
  return historicalData;
};

const generateCorrelatedMockData = (ticker1, ticker2) => {
  // Gerar dados correlacionados para simular cointegração real
  const basePrices = {
    'ITUB4': 32, 'BBDC4': 12, 'BBAS3': 28, 'SANB11': 27, 'ITUB3': 32, 'BBDC3': 13,
    'BPAC11': 32, 'ABCB4': 21, 'BRSR6': 12,
    'PETR4': 38, 'PETR3': 40, 'PRIO3': 45, 'RRRP3': 28, 'RECV3': 18,
    'CSAN3': 13, 'UGPA3': 25, 'VBBR3': 22,
    'VALE3': 62, 'CSNA3': 12, 'GGBR4': 18, 'USIM5': 7, 'GOAU4': 10, 'CMIN3': 5, 'FESA4': 8,
    'ELET3': 42, 'ELET6': 45, 'EGIE3': 42, 'TAEE11': 35, 'TRPL4': 25, 'CMIG4': 12,
    'CMIG3': 15, 'ENGI11': 45, 'CPLE6': 10, 'CPFE3': 35, 'AURE3': 12, 'AESB3': 10, 'NEOE3': 18,
    'MGLU3': 12, 'VIIA3': 1.5, 'LREN3': 18, 'ARZZ3': 65, 'PETZ3': 4, 'SOMA3': 7,
    'CEAB3': 12, 'GUAR3': 7, 'ALPA4': 8,
    'BRFS3': 22, 'JBSS3': 35, 'MRFG3': 14, 'BEEF3': 6, 'ABEV3': 12, 'MDIA3': 28,
    'NTCO3': 15, 'SMTO3': 25, 'RAIZ4': 3, 'CAML3': 9, 'SLCE3': 18,
    'HAPV3': 4, 'RDOR3': 28, 'FLRY3': 15, 'QUAL3': 2, 'ONCO3': 12, 'DASA3': 10,
    'HYPE3': 32, 'RADL3': 25,
    'CYRE3': 22, 'EZTC3': 15, 'MRVE3': 8, 'EVEN3': 7, 'DIRR3': 18, 'TRIS3': 4,
    'LAVV3': 5, 'CURY3': 18, 'PLPL3': 2,
    'BBSE3': 35, 'SULA11': 22, 'PSSA3': 30, 'CXSE3': 12, 'B3SA3': 12, 'CIEL3': 5, 'WIZC3': 6,
    'SUZB3': 55, 'KLBN11': 22, 'KLBN4': 4,
    'MULT3': 25, 'IGTI11': 22, 'BRML3': 8, 'ALSO3': 22, 'JHSF3': 5,
    'VIVT3': 52, 'TIMS3': 16, 'TOTVS3': 28, 'LWSA3': 5, 'CASH3': 12, 'PAGS34': 20, 'INTB3': 18,
    'RAIL3': 22, 'CCRO3': 13, 'ECOR3': 7, 'HBSA3': 4, 'GOLL4': 1.5, 'AZUL4': 5, 'EMBR3': 55,
    'SBSP3': 92, 'CSMG3': 22, 'SAPR11': 25
  };
  
  const basePrice1 = basePrices[ticker1] || 20;
  const basePrice2 = basePrices[ticker2] || 20;
  
  // Correlação entre 0.7 e 0.95 para pares do mesmo setor
  const correlationStrength = 0.7 + Math.random() * 0.25;
  const spreadMeanReversion = 0.1 + Math.random() * 0.2; // Força de reversão à média
  
  const data1 = [];
  const data2 = [];
  
  let price1 = basePrice1 * (0.9 + Math.random() * 0.2);
  let price2 = basePrice2 * (0.9 + Math.random() * 0.2);
  let spread = 0;
  
  const now = Date.now();
  for (let i = 119; i >= 0; i--) {
    const date = Math.floor((now - i * 86400000) / 1000);
    
    // Componente comum do mercado
    const marketMove = (Math.random() - 0.5) * 0.04;
    
    // Componente idiossincrático
    const idio1 = (Math.random() - 0.5) * 0.02 * (1 - correlationStrength);
    const idio2 = (Math.random() - 0.5) * 0.02 * (1 - correlationStrength);
    
    // Spread mean reversion
    spread = spread * (1 - spreadMeanReversion) + (Math.random() - 0.5) * 0.02;
    
    price1 = price1 * (1 + marketMove * correlationStrength + idio1 + spread * 0.5);
    price2 = price2 * (1 + marketMove * correlationStrength + idio2 - spread * 0.5);
    
    price1 = Math.max(price1, basePrice1 * 0.3);
    price2 = Math.max(price2, basePrice2 * 0.3);
    
    data1.push({
      date,
      close: price1,
      open: price1 * (1 + (Math.random() - 0.5) * 0.01),
      high: price1 * (1 + Math.random() * 0.02),
      low: price1 * (1 - Math.random() * 0.02),
      volume: Math.floor(1000000 + Math.random() * 5000000)
    });
    
    data2.push({
      date,
      close: price2,
      open: price2 * (1 + (Math.random() - 0.5) * 0.01),
      high: price2 * (1 + Math.random() * 0.02),
      low: price2 * (1 - Math.random() * 0.02),
      volume: Math.floor(1000000 + Math.random() * 5000000)
    });
  }
  
  return { data1, data2, lastPrice1: price1, lastPrice2: price2 };
};

const BrapiService = {
  // Cache para evitar requisições repetidas
  cache: new Map(),
  cacheTimeout: 60000, // 1 minuto
  useMockData: false, // Será setado para true se API falhar
  mockDataCache: new Map(),
  
  // Buscar cotação atual
  async getQuote(ticker) {
    if (this.useMockData) {
      const cached = this.mockDataCache.get(ticker);
      if (cached) {
        return {
          regularMarketPrice: cached[cached.length - 1].close,
          regularMarketChangePercent: ((cached[cached.length - 1].close / cached[cached.length - 2].close) - 1) * 100
        };
      }
      return null;
    }
    
    const cacheKey = `quote_${ticker}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    try {
      const url = `${BRAPI_CONFIG.BASE_URL}/quote/${ticker}?token=${BRAPI_CONFIG.API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        this.cache.set(cacheKey, { data: data.results[0], timestamp: Date.now() });
        return data.results[0];
      }
      console.warn(`Sem resultados para cotação de ${ticker}:`, data);
      return null;
    } catch (error) {
      console.error(`Erro ao buscar cotação de ${ticker}:`, error);
      // Ativar modo mock se API falhar
      this.useMockData = true;
      return null;
    }
  },
  
  // Buscar dados históricos
  async getHistoricalData(ticker, days = 120) {
    if (this.useMockData) {
      if (!this.mockDataCache.has(ticker)) {
        this.mockDataCache.set(ticker, generateRealisticMockData(ticker));
      }
      return this.mockDataCache.get(ticker);
    }
    
    const cacheKey = `history_${ticker}_${days}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout * 5) {
      return cached.data;
    }
    
    try {
      // Brapi usa range como: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
      const range = days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';
      const url = `${BRAPI_CONFIG.BASE_URL}/quote/${ticker}?range=${range}&interval=1d&token=${BRAPI_CONFIG.API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0 && data.results[0].historicalDataPrice) {
        const historicalData = data.results[0].historicalDataPrice;
        this.cache.set(cacheKey, { data: historicalData, timestamp: Date.now() });
        console.log(`✓ ${ticker}: ${historicalData.length} registros históricos`);
        return historicalData;
      }
      console.warn(`Sem dados históricos para ${ticker}:`, data);
      return [];
    } catch (error) {
      console.error(`Erro ao buscar histórico de ${ticker}:`, error);
      // Ativar modo mock se API falhar
      this.useMockData = true;
      if (!this.mockDataCache.has(ticker)) {
        this.mockDataCache.set(ticker, generateRealisticMockData(ticker));
      }
      return this.mockDataCache.get(ticker);
    }
  },
  
  // Buscar dados correlacionados para um par
  async getCorrelatedPairData(ticker1, ticker2) {
    if (this.useMockData) {
      const cacheKey = `${ticker1}_${ticker2}`;
      if (!this.mockDataCache.has(cacheKey)) {
        const { data1, data2 } = generateCorrelatedMockData(ticker1, ticker2);
        this.mockDataCache.set(ticker1, data1);
        this.mockDataCache.set(ticker2, data2);
        this.mockDataCache.set(cacheKey, true);
      }
      return {
        data1: this.mockDataCache.get(ticker1),
        data2: this.mockDataCache.get(ticker2)
      };
    }
    
    const [data1, data2] = await Promise.all([
      this.getHistoricalData(ticker1),
      this.getHistoricalData(ticker2)
    ]);
    
    return { data1, data2 };
  },
  
  // Limpar cache
  clearCache() {
    this.cache.clear();
    this.mockDataCache.clear();
  },
  
  // Resetar modo mock
  resetMockMode() {
    this.useMockData = false;
    this.mockDataCache.clear();
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const CointegrationDashboard = () => {
  const [pairs, setPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [filterStars, setFilterStars] = useState(0);
  const [filterSector, setFilterSector] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pairs');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, message: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(BRAPI_CONFIG.API_KEY);
  const [showSettings, setShowSettings] = useState(false);
  
  // Simulador
  const [simCapital, setSimCapital] = useState(100000);
  const [simShares1, setSimShares1] = useState(100);
  const [simShares2, setSimShares2] = useState(100);
  const [simResults, setSimResults] = useState(null);

  // Analisar um par de ativos
  const analyzePair = async (pairConfig, index, total) => {
    const { asset1, asset2, sector } = pairConfig;
    
    setLoadingProgress({
      current: index + 1,
      total,
      message: `Analisando ${asset1} × ${asset2}...`
    });
    
    try {
      // Buscar dados - usar método correlacionado para garantir dados realistas
      const { data1: history1, data2: history2 } = await BrapiService.getCorrelatedPairData(asset1, asset2);
      const quote1 = await BrapiService.getQuote(asset1);
      const quote2 = await BrapiService.getQuote(asset2);
      
      if (!history1 || !history2 || history1.length === 0 || history2.length === 0) {
        console.warn(`Dados insuficientes para ${asset1} × ${asset2}: h1=${history1?.length || 0}, h2=${history2?.length || 0}`);
        return null;
      }
      
      // A Brapi retorna dados com campo 'date' como timestamp Unix
      // Criar mapas usando a data como chave
      const dateMap1 = new Map();
      const dateMap2 = new Map();
      
      history1.forEach(d => {
        if (d && d.date && d.close != null) {
          // A Brapi retorna date como timestamp Unix em segundos
          // Normalizar: se > 10 bilhões, está em ms; senão, em segundos
          let timestamp = d.date;
          if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp).getTime() / 1000;
          } else if (timestamp > 9999999999) {
            timestamp = timestamp / 1000; // Converter de ms para segundos
          }
          const dateKey = Math.floor(timestamp / 86400); // Dia único
          dateMap1.set(dateKey, { date: timestamp, close: d.close });
        }
      });
      
      history2.forEach(d => {
        if (d && d.date && d.close != null) {
          let timestamp = d.date;
          if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp).getTime() / 1000;
          } else if (timestamp > 9999999999) {
            timestamp = timestamp / 1000;
          }
          const dateKey = Math.floor(timestamp / 86400);
          dateMap2.set(dateKey, { date: timestamp, close: d.close });
        }
      });
      
      // Encontrar datas em comum
      const commonDateKeys = [...dateMap1.keys()].filter(key => dateMap2.has(key)).sort((a, b) => a - b);
      
      if (commonDateKeys.length < 30) {
        console.warn(`Poucas datas em comum para ${asset1} × ${asset2}: ${commonDateKeys.length} datas`);
        return null;
      }
      
      const prices1 = commonDateKeys.map(key => dateMap1.get(key).close);
      const prices2 = commonDateKeys.map(key => dateMap2.get(key).close);
      const dates = commonDateKeys.map(key => dateMap1.get(key).date);
      
      // Verificar se os preços são válidos
      if (prices1.some(p => p == null || isNaN(p)) || prices2.some(p => p == null || isNaN(p))) {
        console.warn(`Preços inválidos para ${asset1} × ${asset2}`);
        return null;
      }
      
      // Calcular cointegração
      const corr = correlation(prices1, prices2);
      const { alpha, beta, residuals } = linearRegression(prices2, prices1);
      const { tStat, pValue } = adfTest(residuals);
      const halfLife = calculateHalfLife(residuals);
      
      // Calcular Z-Score atual do spread
      const spreadMean = mean(residuals);
      const spreadStd = stdDev(residuals);
      const currentSpread = residuals[residuals.length - 1];
      const zScore = spreadStd > 0 ? (currentSpread - spreadMean) / spreadStd : 0;
      
      // Classificar por estrelas (qualidade do par para swing trade)
      let stars = 1;
      const isCointegrated = pValue < 0.05;
      const hasGoodHalfLife = halfLife <= BRAPI_CONFIG.SWING_TRADE.HALF_LIFE_MAX;
      const hasIdealHalfLife = halfLife <= BRAPI_CONFIG.SWING_TRADE.HALF_LIFE_IDEAL;
      const hasOpportunity = Math.abs(zScore) > 1;
      const hasStrongOpportunity = Math.abs(zScore) > 1.5;
      const hasGoodCorrelation = Math.abs(corr) > 0.7;
      
      if (pValue < 0.01 && hasIdealHalfLife && hasStrongOpportunity && hasGoodCorrelation) stars = 5;
      else if (pValue < 0.03 && hasGoodHalfLife && hasOpportunity && hasGoodCorrelation) stars = 4;
      else if (pValue < 0.05 && hasGoodHalfLife && hasGoodCorrelation) stars = 3;
      else if (isCointegrated || hasGoodCorrelation) stars = 2;
      
      console.log(`✓ ${asset1}×${asset2}: corr=${corr.toFixed(2)}, pValue=${pValue.toFixed(3)}, zScore=${zScore.toFixed(2)}, halfLife=${halfLife}, stars=${stars}`);
      
      return {
        id: `${asset1}_${asset2}`,
        asset1,
        asset2,
        sector,
        stars,
        pValue,
        tStat,
        halfLife,
        correlation: corr,
        beta,
        alpha,
        spread: currentSpread,
        spreadMean,
        spreadStd,
        zScore,
        strategy: zScore > 0 ? 'SHORT/LONG' : 'LONG/SHORT',
        currentPrice1: quote1?.regularMarketPrice || prices1[prices1.length - 1],
        currentPrice2: quote2?.regularMarketPrice || prices2[prices2.length - 1],
        change1: quote1?.regularMarketChangePercent || 0,
        change2: quote2?.regularMarketChangePercent || 0,
        historicalPrices: dates.map((date, i) => {
          // Normalizar o spread para Z-Score
          const normValue = spreadStd > 0 ? (residuals[i] - spreadMean) / spreadStd : 0;
          // Garantir que o valor está dentro de limites razoáveis
          const clampedNorm = Math.max(-5, Math.min(5, normValue));
          
          // Converter data - verificar se já está em ms ou segundos
          const timestamp = date > 9999999999 ? date : date * 1000;
          
          return {
            date: new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            [asset1]: prices1[i],
            [asset2]: prices2[i],
            spread: residuals[i],
            spreadNorm: clampedNorm
          };
        }),
        lastUpdate: new Date().toLocaleTimeString('pt-BR')
      };
    } catch (error) {
      console.error(`Erro ao analisar ${asset1} × ${asset2}:`, error);
      return null;
    }
  };

  // Carregar e analisar todos os pares
  const loadData = useCallback(async () => {
    if (!apiKey && !BRAPI_CONFIG.API_KEY) {
      setShowSettings(true);
      setError('Configure sua API Key da Brapi para começar');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLoadingProgress({ current: 0, total: BRAPI_CONFIG.ANALYSIS_PAIRS.length, message: 'Iniciando análise de 70 pares...' });
    
    try {
      const results = [];
      const batchSize = 5; // Processar 5 pares por vez para não sobrecarregar
      
      // Resetar modo mock antes de começar
      BrapiService.resetMockMode();
      
      for (let i = 0; i < BRAPI_CONFIG.ANALYSIS_PAIRS.length; i += batchSize) {
        const batch = BRAPI_CONFIG.ANALYSIS_PAIRS.slice(i, i + batchSize);
        
        // Processar batch em paralelo
        const batchPromises = batch.map((pairConfig, batchIndex) => 
          analyzePair(pairConfig, i + batchIndex, BRAPI_CONFIG.ANALYSIS_PAIRS.length)
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        // Adicionar resultados válidos
        batchResults.forEach(result => {
          if (result) results.push(result);
        });
        
        // Atualizar progresso
        const modeLabel = BrapiService.useMockData ? ' [SIMULADO]' : '';
        setLoadingProgress({
          current: Math.min(i + batchSize, BRAPI_CONFIG.ANALYSIS_PAIRS.length),
          total: BRAPI_CONFIG.ANALYSIS_PAIRS.length,
          message: `Analisando pares${modeLabel}... (${results.length} válidos)`
        });
        
        // Delay entre batches (menor se usando mock)
        if (i + batchSize < BRAPI_CONFIG.ANALYSIS_PAIRS.length) {
          await new Promise(resolve => setTimeout(resolve, BrapiService.useMockData ? 100 : 1000));
        }
      }
      
      // Ordenar por estrelas e depois por oportunidade (|zScore|)
      results.sort((a, b) => {
        if (b.stars !== a.stars) return b.stars - a.stars;
        return Math.abs(b.zScore) - Math.abs(a.zScore);
      });
      
      setPairs(results);
      setIsConnected(true);
      setIsSimulatedMode(BrapiService.useMockData);
      setLastUpdate(new Date());
      setLoadingProgress({ current: 0, total: 0, message: '' });
      
      if (BrapiService.useMockData) {
        console.log('⚠️ Usando dados simulados (API Brapi não acessível devido a CORS/CSP)');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao conectar com a Brapi. Verifique sua API Key e conexão.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  // Carregar dados ao montar ou quando apiKey mudar
  useEffect(() => {
    if (apiKey || BRAPI_CONFIG.API_KEY) {
      BRAPI_CONFIG.API_KEY = apiKey || BRAPI_CONFIG.API_KEY;
      loadData();
    }
  }, [apiKey]);

  // Auto-refresh para swing trade (a cada 5 minutos durante horário de pregão)
  useEffect(() => {
    const checkMarketHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      // Pregão B3: 10h às 17h, seg a sex
      return day >= 1 && day <= 5 && hour >= 10 && hour < 17;
    };
    
    const interval = setInterval(() => {
      if (checkMarketHours() && isConnected && !isLoading) {
        loadData();
      }
    }, BRAPI_CONFIG.SWING_TRADE.UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isConnected, isLoading, loadData]);

  // Selecionar um par
  const handleSelectPair = (pair) => {
    setSelectedPair(pair);
    
    // Preparar dados históricos com bandas de Bollinger
    const data = pair.historicalPrices.map(d => ({
      ...d,
      meanSpread: 0, // Normalizado
      upperBand: 2,  // +2 desvios padrão
      lowerBand: -2  // -2 desvios padrão
    }));
    
    setHistoricalData(data);
    setActiveTab('chart');
  };

  // Sistema de análise de sinais para entrada (SWING TRADE)
  const analyzeEntrySignal = (pair, histData) => {
    const absZScore = Math.abs(pair.zScore);
    const lastSpreadNorm = histData[histData.length - 1]?.spreadNorm || 0;
    
    // Para swing trade, usamos Z-Score normalizado
    const beyondBand = Math.abs(lastSpreadNorm) > 2;
    const nearBand = Math.abs(lastSpreadNorm) >= 1.5;
    const percentTowardsBand = Math.min(100, (Math.abs(lastSpreadNorm) / 2) * 100);
    
    // ===== ANÁLISE DE QUALIDADE DO SINAL =====
    let signalStrength = 0;
    let signalReasons = [];
    
    // 1. Força da cointegração (p-value baixo = bom)
    if (pair.pValue < 0.01) {
      signalStrength += 25;
      signalReasons.push('Cointegração muito forte (p < 0.01)');
    } else if (pair.pValue < 0.03) {
      signalStrength += 18;
      signalReasons.push('Cointegração forte (p < 0.03)');
    } else if (pair.pValue < 0.05) {
      signalStrength += 10;
      signalReasons.push('Cointegração moderada (p < 0.05)');
    } else {
      signalReasons.push('⚠️ Cointegração fraca');
    }
    
    // 2. Posição do spread em relação às bandas
    if (beyondBand) {
      signalStrength += 30;
      signalReasons.push('🎯 Spread ALÉM da Banda (>' + Math.abs(lastSpreadNorm).toFixed(1) + 'σ)');
    } else if (nearBand) {
      signalStrength += 20;
      signalReasons.push('Spread próximo da banda (' + Math.abs(lastSpreadNorm).toFixed(1) + 'σ)');
    } else if (Math.abs(lastSpreadNorm) >= 1) {
      signalStrength += 10;
      signalReasons.push('Spread a 1σ da média');
    } else {
      signalReasons.push('⚠️ Spread próximo da média (sem oportunidade)');
    }
    
    // 3. Z-Score (magnitude do desvio)
    if (absZScore >= 2.5) {
      signalStrength += 25;
      signalReasons.push('Z-Score extremo (≥ 2.5σ)');
    } else if (absZScore >= 2) {
      signalStrength += 20;
      signalReasons.push('Z-Score forte (≥ 2σ)');
    } else if (absZScore >= 1.5) {
      signalStrength += 12;
      signalReasons.push('Z-Score moderado (≥ 1.5σ)');
    } else if (absZScore >= 1) {
      signalStrength += 5;
      signalReasons.push('Z-Score leve (≥ 1σ)');
    } else {
      signalReasons.push('⚠️ Z-Score baixo (sem desvio significativo)');
    }
    
    // 4. Half-life (tempo de reversão) - IMPORTANTE para Swing Trade
    if (pair.halfLife <= 7) {
      signalStrength += 20;
      signalReasons.push('Reversão muito rápida (≤ 7 dias) ⚡');
    } else if (pair.halfLife <= 15) {
      signalStrength += 15;
      signalReasons.push('Reversão ideal para swing (≤ 15 dias)');
    } else if (pair.halfLife <= 30) {
      signalStrength += 8;
      signalReasons.push('Reversão moderada (≤ 30 dias)');
    } else {
      signalStrength += 2;
      signalReasons.push('⚠️ Reversão lenta (> 30 dias)');
    }
    
    // ===== CLASSIFICAÇÃO DO SINAL =====
    let signalType, signalColor, recommendation;
    
    if (signalStrength >= 80) {
      signalType = 'ENTRADA FORTE';
      signalColor = 'green';
      recommendation = 'Excelente oportunidade para swing trade - todos os indicadores alinhados';
    } else if (signalStrength >= 60) {
      signalType = 'ENTRADA MODERADA';
      signalColor = 'lime';
      recommendation = 'Boa oportunidade - considere posição com stop adequado';
    } else if (signalStrength >= 40) {
      signalType = 'AGUARDAR';
      signalColor = 'yellow';
      recommendation = 'Aguarde melhor ponto de entrada ou spread mais esticado';
    } else {
      signalType = 'NÃO ENTRAR';
      signalColor = 'red';
      recommendation = 'Sem oportunidade - spread na média ou cointegração fraca';
    }
    
    // ===== ANÁLISE DE RISCO DA OPERAÇÃO =====
    let riskFactors = [];
    let structuralRisk = 0;
    
    if (pair.pValue >= 0.05) {
      structuralRisk += 15;
      riskFactors.push('Cointegração estatisticamente fraca');
    }
    
    if (pair.halfLife > 30) {
      structuralRisk += 10;
      riskFactors.push('Tempo de reversão longo para swing');
    }
    
    if (absZScore > 3.5) {
      structuralRisk += 15;
      riskFactors.push('Z-Score muito extremo - verificar quebra');
    }
    
    if (pair.correlation < 0.7) {
      structuralRisk += 10;
      riskFactors.push('Correlação abaixo do ideal');
    }
    
    const timingRisk = 100 - signalStrength;
    const totalRiskScore = Math.min(100, (timingRisk * 0.7) + (structuralRisk * 0.3));
    
    let riskLevel, riskColor;
    if (totalRiskScore >= 60) {
      riskLevel = 'ALTO';
      riskColor = 'red';
      if (signalStrength < 40) {
        riskFactors.unshift('Momento inadequado para entrada');
      }
    } else if (totalRiskScore >= 35) {
      riskLevel = 'MODERADO';
      riskColor = 'yellow';
    } else {
      riskLevel = 'BAIXO';
      riskColor = 'green';
      if (riskFactors.length === 0) {
        riskFactors.push('Condições favoráveis para swing trade');
      }
    }
    
    return {
      signalStrength,
      signalType,
      signalColor,
      signalReasons,
      recommendation,
      riskLevel,
      riskColor,
      riskScore: totalRiskScore,
      riskFactors,
      percentTowardsBand,
      beyondBand,
      bandPosition: beyondBand ? 'ALÉM' : (nearBand ? 'PRÓXIMO' : 'DENTRO'),
      halfLife: pair.halfLife
    };
  };

  // Calcular simulação
  const calculateSimulation = () => {
    if (!selectedPair || historicalData.length === 0) return;
    
    const position1Value = simShares1 * selectedPair.currentPrice1;
    const position2Value = simShares2 * selectedPair.currentPrice2;
    const capitalUsed = position1Value + position2Value;
    
    const analysis = analyzeEntrySignal(selectedPair, historicalData);
    
    // Retorno esperado baseado no Z-Score e força do sinal
    const baseReturn = Math.abs(selectedPair.zScore) * 1.2; // Mais conservador para dados reais
    const confidenceMultiplier = analysis.signalStrength / 100;
    const expectedReturn = Math.min(baseReturn * (0.5 + confidenceMultiplier * 0.5), 8);
    
    const potentialProfit = capitalUsed * (expectedReturn / 100);
    
    const isLongShort = selectedPair.strategy === 'LONG/SHORT';
    const netExposure = isLongShort ? (position1Value - position2Value) : (position2Value - position1Value);
    
    setSimResults({
      position1Value,
      position2Value,
      netExposure,
      capitalUsed,
      expectedReturn,
      potentialProfit,
      ...analysis
    });
  };

  // Obter lista de setores únicos
  const sectors = [...new Set(pairs.map(p => p.sector))].sort();

  // Filtrar pares
  const filteredPairs = pairs.filter(pair => {
    const matchesStars = filterStars === 0 || pair.stars >= filterStars;
    const matchesSector = filterSector === '' || pair.sector === filterSector;
    const matchesSearch = searchTerm === '' || 
      pair.asset1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.asset2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStars && matchesSector && matchesSearch;
  });

  // Componente de estrelas
  const StarRating = ({ stars }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-['Inter',system-ui,sans-serif]">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-400" size={32} strokeWidth={2.5} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-cyan-400">COINTEGRA.BR</h1>
                <p className="text-xs text-gray-400 tracking-wider">
                  SWING TRADE QUANTITATIVO • {isSimulatedMode ? 'DADOS SIMULADOS' : 'DADOS BRAPI'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status de conexão e modo */}
              <div className="flex items-center gap-2 text-sm">
                {isConnected ? (
                  isSimulatedMode ? (
                    <>
                      <AlertTriangle size={16} className="text-yellow-400" />
                      <span className="text-yellow-400">Modo Simulado</span>
                    </>
                  ) : (
                    <>
                      <Wifi size={16} className="text-green-400" />
                      <span className="text-green-400">API Conectada</span>
                    </>
                  )
                ) : (
                  <>
                    <WifiOff size={16} className="text-red-400" />
                    <span className="text-red-400">Desconectado</span>
                  </>
                )}
              </div>
              
              {/* Última atualização */}
              {lastUpdate && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>{lastUpdate.toLocaleTimeString('pt-BR')}</span>
                </div>
              )}
              
              {/* Botão configurações */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
                title="Configurações"
              >
                <Settings size={18} className="text-gray-400" />
              </button>
              
              {/* Botão atualizar */}
              <button 
                onClick={loadData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span className="text-sm">ATUALIZAR</span>
              </button>
            </div>
          </div>
          
          {/* Aviso de modo simulado */}
          {isSimulatedMode && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400">
              <AlertTriangle size={16} />
              <span className="text-sm">
                <strong>Modo Simulado:</strong> A API Brapi não está acessível (CORS/CSP). Os dados exibidos são simulados para demonstração. 
                Para dados reais, hospede o sistema em seu próprio servidor.
              </span>
            </div>
          )}
          
          {/* Painel de configurações */}
          {showSettings && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Configuração da API Brapi</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Cole sua API Key aqui (obtenha grátis em brapi.dev)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-slate-900 border border-gray-600 rounded px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 outline-none"
                />
                <button
                  onClick={() => {
                    BRAPI_CONFIG.API_KEY = apiKey;
                    setShowSettings(false);
                    loadData();
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold rounded transition-colors"
                >
                  Salvar e Conectar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Cadastre-se gratuitamente em <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">brapi.dev</a> para obter sua API Key
              </p>
            </div>
          )}
          
          {/* Barra de progresso */}
          {isLoading && loadingProgress.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{loadingProgress.message}</span>
                <span>{loadingProgress.current}/{loadingProgress.total}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Mensagem de erro */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertTriangle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </header>

      {/* Navegação */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 border-b border-gray-800 pb-4">
          {[
            { id: 'pairs', label: 'PARES COINTEGRADOS', icon: BarChart3 },
            { id: 'chart', label: 'ANÁLISE GRÁFICA', icon: Activity },
            { id: 'simulator', label: 'SIMULADOR', icon: Calculator }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Tab: Pares Cointegrados */}
        {activeTab === 'pairs' && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center bg-slate-900/50 p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por ticker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                />
              </div>
              
              {/* Filtro por Setor */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Setor:</span>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="bg-slate-800 border border-gray-700 rounded px-3 py-1 text-sm text-white outline-none focus:border-cyan-500"
                >
                  <option value="">Todos os Setores</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por Estrelas */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <span className="text-sm text-gray-400">Mínimo:</span>
                <div className="flex gap-1">
                  {[0, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setFilterStars(n)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        filterStars === n 
                          ? 'bg-cyan-500 text-slate-900 font-semibold' 
                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                      }`}
                    >
                      {n === 0 ? 'Todos' : `${n}★`}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredPairs.length} de {pairs.length} pares
              </div>
            </div>

            {/* Lista de pares */}
            <div className="grid gap-3">
              {filteredPairs.length === 0 && !isLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum par encontrado. Ajuste os filtros ou atualize os dados.</p>
                </div>
              ) : (
                filteredPairs.map(pair => (
                  <div
                    key={pair.id}
                    onClick={() => handleSelectPair(pair)}
                    className="bg-slate-900/50 border border-gray-800 hover:border-cyan-500/50 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-cyan-400">{pair.asset1}</span>
                            <span className="text-gray-500">×</span>
                            <span className="text-lg font-bold text-purple-400">{pair.asset2}</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-gray-400">{pair.sector}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <StarRating stars={pair.stars} />
                            <span className="text-xs text-gray-500">
                              Atualizado: {pair.lastUpdate}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Z-Score</p>
                          <p className={`text-lg font-bold ${
                            Math.abs(pair.zScore) >= 2 ? 'text-green-400' :
                            Math.abs(pair.zScore) >= 1.5 ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            {pair.zScore >= 0 ? '+' : ''}{pair.zScore.toFixed(2)}σ
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Half-Life</p>
                          <p className={`text-lg font-bold ${
                            pair.halfLife <= 10 ? 'text-green-400' :
                            pair.halfLife <= 20 ? 'text-yellow-400' : 'text-orange-400'
                          }`}>
                            {pair.halfLife}d
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-500">p-value</p>
                          <p className={`text-lg font-bold ${
                            pair.pValue < 0.01 ? 'text-green-400' :
                            pair.pValue < 0.05 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {pair.pValue.toFixed(3)}
                          </p>
                        </div>
                        
                        <div className="text-center min-w-[100px]">
                          <p className="text-xs text-gray-500">Estratégia</p>
                          <div className="flex items-center gap-1 justify-center">
                            {pair.strategy === 'LONG/SHORT' ? (
                              <>
                                <TrendingUp size={16} className="text-green-400" />
                                <span className="text-xs text-green-400">LONG</span>
                                <span className="text-gray-500">/</span>
                                <TrendingDown size={16} className="text-red-400" />
                                <span className="text-xs text-red-400">SHORT</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown size={16} className="text-red-400" />
                                <span className="text-xs text-red-400">SHORT</span>
                                <span className="text-gray-500">/</span>
                                <TrendingUp size={16} className="text-green-400" />
                                <span className="text-xs text-green-400">LONG</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Análise Gráfica */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            {!selectedPair ? (
              <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-12 text-center">
                <Activity size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Selecione um par na aba "PARES COINTEGRADOS" para visualizar a análise</p>
              </div>
            ) : (
              <>
                {/* Header do par selecionado */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-cyan-400">{selectedPair.asset1}</span>
                        <span className="text-xl text-gray-500">×</span>
                        <span className="text-2xl font-bold text-purple-400">{selectedPair.asset2}</span>
                        <StarRating stars={selectedPair.stars} />
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Setor: {selectedPair.sector} • Correlação: {(selectedPair.correlation * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{selectedPair.asset1}</p>
                        <p className="text-xl font-bold text-cyan-400">
                          R$ {selectedPair.currentPrice1?.toFixed(2)}
                        </p>
                        <p className={`text-xs ${selectedPair.change1 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedPair.change1 >= 0 ? '+' : ''}{selectedPair.change1?.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{selectedPair.asset2}</p>
                        <p className="text-xl font-bold text-purple-400">
                          R$ {selectedPair.currentPrice2?.toFixed(2)}
                        </p>
                        <p className={`text-xs ${selectedPair.change2 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedPair.change2 >= 0 ? '+' : ''}{selectedPair.change2?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Preços */}
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4">HISTÓRICO DE PREÇOS (120 dias)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={selectedPair.asset1} 
                          stroke="#22d3ee" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={selectedPair.asset2} 
                          stroke="#a855f7" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico do Spread Normalizado */}
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4">SPREAD NORMALIZADO (Z-Score)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis 
                          stroke="#64748b" 
                          tick={{ fontSize: 10 }} 
                          domain={[-3, 3]}
                          allowDataOverflow={true}
                          tickFormatter={(value) => `${value}σ`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value) => {
                            const num = typeof value === 'number' ? value : 0;
                            return [num.toFixed(2) + 'σ', 'Z-Score'];
                          }}
                        />
                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Média', fill: '#64748b', fontSize: 10 }} />
                        <ReferenceLine y={2} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '+2σ', fill: '#22c55e', fontSize: 10 }} />
                        <ReferenceLine y={-2} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '-2σ', fill: '#22c55e', fontSize: 10 }} />
                        <ReferenceLine y={1.5} stroke="#eab308" strokeDasharray="2 2" />
                        <ReferenceLine y={-1.5} stroke="#eab308" strokeDasharray="2 2" />
                        <Line 
                          type="monotone" 
                          dataKey="spreadNorm" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          dot={false}
                          name="Z-Score"
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-green-500"></span>
                        <span className="text-gray-500">±2σ (Banda de Bollinger)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-yellow-500"></span>
                        <span className="text-gray-500">±1.5σ (Alerta)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas detalhadas */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Z-Score Atual</p>
                    <p className={`text-2xl font-bold ${
                      Math.abs(selectedPair.zScore) >= 2 ? 'text-green-400' :
                      Math.abs(selectedPair.zScore) >= 1.5 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {selectedPair.zScore >= 0 ? '+' : ''}{selectedPair.zScore.toFixed(2)}σ
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Half-Life</p>
                    <p className={`text-2xl font-bold ${
                      selectedPair.halfLife <= 10 ? 'text-green-400' :
                      selectedPair.halfLife <= 20 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {selectedPair.halfLife} dias
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">P-Value (ADF)</p>
                    <p className={`text-2xl font-bold ${
                      selectedPair.pValue < 0.01 ? 'text-green-400' :
                      selectedPair.pValue < 0.05 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedPair.pValue.toFixed(3)}
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Correlação</p>
                    <p className={`text-2xl font-bold ${
                      selectedPair.correlation >= 0.8 ? 'text-green-400' :
                      selectedPair.correlation >= 0.7 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {(selectedPair.correlation * 100).toFixed(0)}%
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Beta (Hedge Ratio)</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedPair.beta?.toFixed(3)}
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Estratégia</p>
                    <p className={`text-lg font-bold ${
                      selectedPair.strategy === 'LONG/SHORT' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedPair.strategy}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Simulador */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {!selectedPair ? (
              <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-12 text-center">
                <Calculator size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Selecione um par cointegrado na aba "PARES COINTEGRADOS" para simular operações</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-2">SIMULADOR DE SWING TRADE</h2>
                  <p className="text-sm text-gray-400">
                    Par Selecionado: <span className="text-cyan-400 font-semibold">{selectedPair.asset1}</span> (R$ {selectedPair.currentPrice1?.toFixed(2)}) × <span className="text-purple-400 font-semibold">{selectedPair.asset2}</span> (R$ {selectedPair.currentPrice2?.toFixed(2)})
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4 tracking-wider">PARÂMETROS DA SIMULAÇÃO</h3>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Capital Disponível (R$)</label>
                      <input
                        type="number"
                        value={simCapital}
                        onChange={(e) => setSimCapital(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Quantidade de Ações {selectedPair.asset1} 
                        <span className="text-cyan-400 ml-2">
                          (Total: R$ {(simShares1 * selectedPair.currentPrice1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </span>
                      </label>
                      <input
                        type="number"
                        value={simShares1}
                        onChange={(e) => setSimShares1(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">
                        Quantidade de Ações {selectedPair.asset2}
                        <span className="text-purple-400 ml-2">
                          (Total: R$ {(simShares2 * selectedPair.currentPrice2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </span>
                      </label>
                      <input
                        type="number"
                        value={simShares2}
                        onChange={(e) => setSimShares2(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    
                    {/* Sugestão de hedge ratio */}
                    <div className="p-3 bg-slate-800/50 rounded border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">💡 Sugestão baseada no Hedge Ratio ({selectedPair.beta?.toFixed(2)})</p>
                      <button
                        onClick={() => {
                          const suggestedShares2 = Math.round(simShares1 * selectedPair.beta);
                          setSimShares2(suggestedShares2);
                        }}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        Ajustar {selectedPair.asset2} para {Math.round(simShares1 * selectedPair.beta)} ações
                      </button>
                    </div>

                    <button
                      onClick={calculateSimulation}
                      className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold rounded transition-all duration-300 shadow-lg shadow-cyan-500/20"
                    >
                      CALCULAR SIMULAÇÃO
                    </button>
                  </div>

                  {/* Results */}
                  <div className="bg-slate-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4 tracking-wider">RESULTADOS DA SIMULAÇÃO</h3>
                    
                    {simResults ? (
                      <div className="space-y-4">
                        {/* Sinal de Entrada */}
                        <div className={`p-4 rounded-lg border-2 ${
                          simResults.signalColor === 'green' ? 'bg-green-500/10 border-green-500' :
                          simResults.signalColor === 'lime' ? 'bg-lime-500/10 border-lime-500' :
                          simResults.signalColor === 'yellow' ? 'bg-yellow-500/10 border-yellow-500' :
                          'bg-red-500/10 border-red-500'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-400">SINAL DE ENTRADA</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              simResults.bandPosition === 'ALÉM' ? 'bg-green-500/30 text-green-300' :
                              simResults.bandPosition === 'PRÓXIMO' ? 'bg-yellow-500/30 text-yellow-300' :
                              'bg-gray-500/30 text-gray-300'
                            }`}>
                              {simResults.bandPosition} DA BANDA
                            </span>
                          </div>
                          <p className={`text-2xl font-bold ${
                            simResults.signalColor === 'green' ? 'text-green-400' :
                            simResults.signalColor === 'lime' ? 'text-lime-400' :
                            simResults.signalColor === 'yellow' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {simResults.signalType}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">{simResults.recommendation}</p>
                          <div className="mt-3 bg-slate-800/50 rounded p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Força do Sinal:</span>
                              <div className="flex-1 bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    simResults.signalStrength >= 80 ? 'bg-green-500' :
                                    simResults.signalStrength >= 60 ? 'bg-lime-500' :
                                    simResults.signalStrength >= 40 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${simResults.signalStrength}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-white">{simResults.signalStrength}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Fatores do Sinal */}
                        <div className="p-4 bg-slate-800/50 rounded">
                          <p className="text-xs text-gray-400 mb-2">FATORES DO SINAL</p>
                          <ul className="space-y-1">
                            {simResults.signalReasons.map((reason, idx) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className={reason.includes('⚠️') ? 'text-yellow-400' : 'text-green-400'}>
                                  {reason.includes('⚠️') ? '•' : '✓'}
                                </span>
                                {reason.replace('⚠️ ', '')}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Nível de Risco e Tempo */}
                        <div className={`p-4 rounded border ${
                          simResults.riskColor === 'red' ? 'bg-red-500/10 border-red-500/50' :
                          simResults.riskColor === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/50' :
                          'bg-green-500/10 border-green-500/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">NÍVEL DE RISCO</p>
                              <p className={`text-xl font-bold ${
                                simResults.riskColor === 'red' ? 'text-red-400' :
                                simResults.riskColor === 'yellow' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {simResults.riskLevel}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 mb-1">TEMPO ESPERADO</p>
                              <p className="text-xl font-bold text-orange-400">
                                {simResults.halfLife} dias
                              </p>
                              <p className="text-xs text-gray-500">meia-vida</p>
                            </div>
                          </div>
                          {simResults.riskFactors.length > 0 && (
                            <ul className="mt-3 pt-3 border-t border-gray-700 space-y-1">
                              {simResults.riskFactors.map((factor, idx) => (
                                <li key={idx} className="text-xs text-gray-400">• {factor}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Valores das posições */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-800/50 rounded">
                            <p className="text-xs text-gray-400 mb-1">Posição {selectedPair.asset1}</p>
                            <p className="text-lg font-bold text-cyan-400">
                              R$ {simResults.position1Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-800/50 rounded">
                            <p className="text-xs text-gray-400 mb-1">Posição {selectedPair.asset2}</p>
                            <p className="text-lg font-bold text-purple-400">
                              R$ {simResults.position2Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded">
                          <p className="text-xs text-gray-400 mb-1">Capital Utilizado</p>
                          <p className="text-xl font-bold text-white">
                            R$ {simResults.capitalUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded">
                            <p className="text-xs text-gray-400 mb-1">Retorno Esperado</p>
                            <p className="text-xl font-bold text-green-400">
                              {simResults.expectedReturn.toFixed(2)}%
                            </p>
                          </div>
                          <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded">
                            <p className="text-xs text-gray-400 mb-1">Lucro Potencial</p>
                            <p className="text-xl font-bold text-cyan-400">
                              R$ {simResults.potentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p className="text-center">Configure os parâmetros e clique em "CALCULAR SIMULAÇÃO"</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500">
            Sistema quantitativo para Swing Trade • Dados via Brapi (delay ~15min) • Cálculos de cointegração em tempo real
          </p>
          <p className="text-xs text-gray-600 mt-2">
            ⚠️ Este sistema é apenas educacional. Não constitui recomendação de investimento. Opere com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CointegrationDashboard;
