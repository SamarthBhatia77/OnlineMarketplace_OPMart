import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';  // ✅ Relative path
import Product from '../../../models/Product';  // ✅ Relative path

export async function GET() {
  try {
    await connectDB();
    
    // ✅ Using lean() is good for performance - converts to plain JS objects
    const products = await Product.find({}).lean();
    
    // ✅ Convert MongoDB ObjectId to string for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString()  // Convert ObjectId to string
    }));
    
    return NextResponse.json({ 
      success: true, 
      products: serializedProducts 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
