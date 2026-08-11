import Image from "next/image";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";
import { GrSupport } from "react-icons/gr";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <>
  
      <div className="bg-[#0B2239] p-4 text-white">
        <div className="container mx-auto flex justify-between border-b border-gray-600 p-4">
          <div className="w-1/3 leading-6 border-r border-gray-600 p-4">
            <Image
              src="/Image/logo.png"
              width={400}
              height={400}
              alt="I-Technology"
              className="w-9/12 pb-3"
            />
            <p className="pb-3">
              Your trusted destination for the lastest electronics and best
              service
            </p>
            <div className="flex gap-3">
              <Link
                href="https://www.facebook.com/ITechnology2016"
                target="_blank"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="https://www.instagram.com/itechnology2016/"
                target="_blank"
              >
                <FaInstagram />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCzot5XSyPnRHjjTb2UyvcOQ"
                target="_blank"
              >
                <FaYoutube />
              </Link>
              <Link
                href="https://www.tiktok.com/@itechnology2016"
                target="_blank"
              >
                <FaTiktok />
              </Link>
              <Link
                href="https://www.linkedin.com/company/itechnologycompany/posts/?feedView=all"
                target="_blank"
              >
                <FaLinkedinIn />
              </Link>
            </div>
          </div>

          <div className="w-1/3 leading-6 border-r border-gray-600 p-4">
            <div className="flex flex-col gap-3">
              <p>Shop</p>
              <Link href="">Mobiles</Link>
              <Link href="">Laptops & PC</Link>
              <Link href="">Accessories</Link>
              <Link href="">Gaming</Link>
              <Link href="">Home Appliances</Link>
            </div>
          </div>

          <div className="w-1/3 leading-6 border-r border-gray-600 p-4">
            <div className="flex flex-col gap-3">
              <p>Customer Service</p>
              <Link href="">Contact Us</Link>
              <Link href="">Returns & Refunds</Link>
              <Link href="">Track Order</Link>
              <Link href="">Shipping Info</Link>
              <Link href="">FAQ</Link>
            </div>
          </div>

          <div className="w-1/3 leading-6 border-r border-gray-600 p-4">
            <div className="flex flex-col gap-3">
              <p>About Us</p>
              <Link href="">About I-Technology</Link>
              <Link href="">Jobs</Link>
              <Link href="">Blog</Link>
              <Link href="">Privacy Policy</Link>
              <Link href="">Terms & Conditions</Link>
            </div>
          </div>

          <div className="w-1/3 p-4 flex flex-col gap-4">
            <p>We Accept</p>
            <div className="grid grid-cols-3 items-center gap-2">
              <Image
                src="/Image/visa1.png"
                height={200}
                width={200}
                alt="visa"
                className="w-full"
              />
              <Image
                src="/Image/MasterCard.png"
                height={200}
                width={200}
                alt="visa"
                className="w-full"
              />
              <Image
                src="/Image/Valu.png"
                height={200}
                width={200}
                alt="visa"
                className="w-full"
              />
              <Image
                src="/Image/SEVEN.png"
                height={200}
                width={200}
                alt="visa"
                className="w-full"
              />
              <Image
                src="/Image/Sohoola.png"
                height={200}
                width={200}
                alt="visa"
                className="w-full"
              />
              <Image
                src="/Image/TRU.png"
                height={200}
                width={200}
                alt="visa"
                className="w-full"
              />
            </div>
            <p>100% Secure Payments</p>
          </div>
        </div>
       
            <div className="flex container mx-auto gap-4 justify-center items-center pt-5">
          <div>
            <MdSupportAgent className="inline text-xl" />
            <span>01002884418</span>
          </div>
          <div>
            <GrSupport className="inline text-xl" />
            <span>wecare@i-techegypt.com</span>
          </div>
          <p>
          © {year} I-Technology Built by Mahmoud Amer
          </p>
        </div>
     
      </div>
    </>
  );
}
