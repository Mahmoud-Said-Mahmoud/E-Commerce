import Slider from "@/components/Slider/Slider";
import Category from "@/components/Category/Category";
import Trend from "@/components/Trend/Trend";
import Todays from "@/components/Today's Deals/todays";
import Brands from "@/components/Brands/Brands";


export default function Home() {
  return (
    <>
      <Slider />
      <Category />
      <Trend />
      <Todays />
     
      <Brands />
      
    </>
  );
}