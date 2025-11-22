import { NextResponse } from "next/server";
import { createWholesalerWProd } from "../../../../../online_marketplace_backend/server.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      wholesalerId,
      productName,
      description,
      sellingPrice,
      numberOfItems,
      category,
      base64Image,
    } = body;

    if (
      !wholesalerId ||
      !productName ||
      !description ||
      !sellingPrice ||
      !numberOfItems ||
      !category ||
      !base64Image
    ) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const item = await createWholesalerWProd({
      wholesalerId,
      productName,
      description,
      sellingPrice,
      numberOfItems,
      category,
      base64Image,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("Create WProd error:", err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
