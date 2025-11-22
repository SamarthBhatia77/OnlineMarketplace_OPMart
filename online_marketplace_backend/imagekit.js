// online_marketplace_backend/imagekit.js
import dotenv from "dotenv";
dotenv.config();
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadToImageKit(base64Image, fileName) {
  const base64 = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  const res = await imagekit.upload({
    file: base64,
    fileName: fileName || "wholesaler_product",
    useUniqueFileName: true,
    folder: "/wholesaler-products",
  });

  return res.url;
}
