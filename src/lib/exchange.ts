const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export type ExchangeRates = {
  TRY: number;
  USD: number;
  EUR: number;
  AED: number;
};

type CacheEntry = {
  rates: ExchangeRates;
  fetchedAt: number;
};

let cache: CacheEntry | null = null;

export async function getExchangeRates(): Promise<ExchangeRates> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  const response = await fetch(TCMB_URL, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error("TCMB kur verisi alınamadı");
  }

  const xml = await response.text();

  const usd = extractRate(xml, "USD");
  const eur = extractRate(xml, "EUR");
  const aed = extractRate(xml, "AED");

  if (!usd || !eur || !aed) {
    throw new Error("TCMB kur verisi parse edilemedi");
  }

  cache = {
    rates: { TRY: 1, USD: usd, EUR: eur, AED: aed },
    fetchedAt: Date.now(),
  };

  return cache.rates;
}

export function convertToTry(amount: number, currency: string | null | undefined, rates: ExchangeRates) {
  if (!amount) {
    return 0;
  }
  const code = (currency ?? "TRY").toUpperCase();
  if (code === "TRY" || !rates[code as keyof ExchangeRates]) {
    return amount;
  }
  const rate = rates[code as keyof ExchangeRates];
  return amount * rate;
}

function extractRate(xml: string, code: "USD" | "EUR" | "AED") {
  const currencyBlock = xml.match(
    new RegExp(`<Currency[^>]*Kod="${code}"[\\s\\S]*?<\\/Currency>`),
  );
  if (!currencyBlock) {
    return null;
  }
  const section = currencyBlock[0];
  const match =
    section.match(/<BanknoteBuying>([\d.,]+)<\/BanknoteBuying>/) ||
    section.match(/<ForexBuying>([\d.,]+)<\/ForexBuying>/);
  if (!match) {
    return null;
  }
  const normalized = match[1].replace(",", "."); // TCMB uses comma decimals
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}
