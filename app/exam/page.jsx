import "./exams.css";
import { IconPhone } from "@tabler/icons-react";

function Exam() {
  return (
    <>
      <section className="bg-black">
        <div className="flex items-center justify-between w-[1300px] mx-auto py-[20px]">
          <div className="">
            <img
              src="https://assets.nicepagecdn.com/d2cc3eaa/6538925/images/smart-home-logo.png"
              className="w-[60px]"
              alt=""
            />
          </div>
          <div className="flex gap-8">
            <a href="" className="text-white text-[18px] cursor-pointer">
              HOME
            </a>
            <a href="" className="text-white text-[18px] cursor-pointer">
              PAGES{" "}
            </a>
            <a href="" className="text-white text-[18px] cursor-pointer">
              CONTACT US
            </a>
          </div>
          <div className="">
            <div className="flex items-center bg-[#fe607c] gap-2 px-5 py-3 rounded-[40px]  ">
              <IconPhone color="white" fill="white" className="" />
              <h1 className="text-white text-[18px]">+1(234) 567-8910</h1>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#dbb5c0]">
        <div className="flex items-center w-[1300px] mx-auto">
          <div className=" ">
            <img
              className="w-[600px] object-cover"
              src="https://png.pngtree.com/png-vector/20240325/ourmid/pngtree-hands-raising-mobile-phone-on-transparent-background-png-image_12239150.png"
              alt=""
            />
          </div>
          <div className="">
            <div className="flex gap-2">
              <div className="">
                <img
                  src="https://assets.nicepagecdn.com/d2cc3eaa/6538925/images/2163300.png"
                  alt=""
                  className="w-[60px]"
                />
              </div>
              <div className="">
                <h1 className="font-[700]">20M+ Users</h1>
                <div className="flex items-center mt-[7px]">
                  <h1 className="text-[18px]">Read Our </h1>
                  <a href="" className="underline text-[18px]">
                    Successful stories
                  </a>
                </div>
              </div>
            </div>
            <h1 className="text-[70px] leading-none font-[700] mt-[40px]">
              Revolutionary <br /> smart home app
            </h1>
            <p className="text-[18px] mt-[30px]">
              Mobile-first smart home management: optimized dashboard UI for
              immediate <br /> efficiency. Image from
            </p>
            <button className="w-[200px] bg-[#fe607c] py-4 text-[18px] hover:bg-black duration-300 mt-[20px] text-white rounded-[30px]">
              Learn more
            </button>
          </div>
        </div>
      </section>
      <section className="">
        <div className="flex items-center w-[1300px] mx-auto">
          <div className="">
            <h1>Key Benefits of Our Smart Home App</h1>
            <p>
              Mobile-first smart home management: optimized dashboard UI for
              immediate <br /> efficiency. Image from
              </p>
            <button className="w-[200px] bg-[#fe607c] py-4 text-[18px] hover:bg-black duration-300 mt-[20px] text-white rounded-[30px]">
              Learn more
            </button>
          </div>
          <div className="">
            <img
              src="https://img.freepik.com/free-photo/side-view-kid-relaxing-with-tablet_23-2150639951.jpg?semt=ais"
              alt=""
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default Exam;
