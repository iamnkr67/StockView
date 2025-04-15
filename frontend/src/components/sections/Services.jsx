import React from "react";
import { RiComputerLine } from "react-icons/ri";
import { CiMobile3 } from "react-icons/ci";
import { TbWorldWww } from "react-icons/tb";
import { IoMdHappy } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { IoPulseOutline } from "react-icons/io5";
import { BarChart, TrendingUp, AlertTriangle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const ServicesData = [
  {
    id: 1,
    title: (
      <h2 className="font-bold">
        Realtime<span className="text-secondary"> Market Updates</span>
      </h2>
    ),
    link: "#",
    icon: (
      <DotLottieReact
        src="https://lottie.host/4fa6dea1-00ae-4270-92bb-707e0dca85f7/y1RKT1FFCn.lottie"
        loop
        autoplay
        className="w-32 h-32"
      />
    ),

    delay: 0.2,
  },
  {
    id: 2,
    title: (
      <h2 className="font-bold">
        Customized{" "}
        <span className="font-bold text-secondary">Stock Price Alert</span>
      </h2>
    ),
    link: "#",
    icon: (<DotLottieReact
      src="https://lottie.host/3fd2ec77-52c5-41a0-8e4d-dc74f44bed68/KZ0M1qYoZa.lottie"
      loop
      autoplay
              className="w-32 h-32"
    />),
    delay: 0.3,
  },
  {
    id: 3,
    title: (
      <h2>
        <span className="font-bold">Stock</span>
        <span className="text-secondary font-extrabold">ViewAI</span>-driven
        market foresight
      </h2>
    ),
    link: "#",
    icon: ( <DotLottieReact
      src="https://lottie.host/f2bda5a4-fc8e-4d6c-bd1f-ccca217d2660/j1B7QqZJIN.lottie"
      loop
      autoplay
      className="w-32 h-32"
    />),
    delay: 0.4,
  },
  {
    id: 4,
    title: (
      <h2 className="font-bold">
        24/7 <span className="text-secondary font-bold">Support</span>
      </h2>
    ),
    link: "#",
    icon: (
      <DotLottieReact
        src="https://lottie.host/0d8206df-73ad-46b7-b90e-ccd96f032125/fb6WijLU4O.lottie"
        loop
        autoplay
        className="w-40 h-32"
      />
    ),
    delay: 0.5,
  },
];

const SlideLeft = (delay) => {
  return {
    initial: {
      opacity: 0,
      x: 50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};
const Services = () => {
  return (
    <section id="services" className="bg-white">
      <div className="container pb-14 pt-16">
        <h1 className="text-4xl font-bold text-left pb-10">
          Services we provide
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 p-6">
          {ServicesData.map((service) => (
            <motion.div
              variants={SlideLeft(service.delay)}
              initial="initial"
              whileInView={"animate"}
              viewport={{ once: true }}
              className="bg-[#f4f4f4] rounded-2xl flex flex-col gap-4 items-center justify-center p-4 py-7 hover:bg-white hover:scale-110 duration-300 hover:shadow-2xl"
            >
              <div className="text-4xl mb-4"> {service.icon}</div>
              <h1 className="text-lg font-semibold text-center px-3">
                {service.title}
              </h1>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
