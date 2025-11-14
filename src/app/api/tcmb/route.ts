import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/exchange";

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json(
    {
      rates,
      fetchedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=300",
      },
    },
  );
}
