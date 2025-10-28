import Image from "next/image";
import Footer from "../../components/footer";
import Navbar from "../../components/navbar";
export default function Home() {
  return (
    <div className="">
      <Navbar/>
      <p className="mt-40 mb-40 ml-145 underline">Content of the page will go here !</p>
      <Footer/>
    </div>
  );
}
