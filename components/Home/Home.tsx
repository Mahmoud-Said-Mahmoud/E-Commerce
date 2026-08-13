import Slider from "@/components/Slider/Slider";
import Category from "@/components/Category/Category";
import Trend from "@/components/Trend/Trend";
import Todays from "@/components/Today's Deals/todays";
import Assec from "@/components/Assces/Assec";
import Brands from "@/components/Brands/Brands";
import Info from "@/components/Info/Info";
import CouponBanner from "@/components/CouponBanner/CouponBanner";

export default function Home() {
  return (
    <>
      <Slider />
      <Category />
      <Trend />
      <Todays />
      <CouponBanner/>
      <Brands />
      
    </>
  );
}