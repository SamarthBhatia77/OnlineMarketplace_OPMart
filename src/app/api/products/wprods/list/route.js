import { NextResponse } from "next/server";
import { getWholesalerWProds } from "../../../../../online_marketplace_backend/server.js";

export async function POST(req) {
  try {
    const { wholesalerId } = await req.json();
    if (!wholesalerId) {
      return NextResponse.json(
        { message: "wholesalerId is required" },
        { status: 400 }
      );
    }

    const items = await getWholesalerWProds(wholesalerId);
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Get WProds error:", err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}