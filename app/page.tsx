import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

import Link from "next/link";

export default function Home() {
  return (
    <main className="">
      <section className="flex flex-col md:flex-row items-center bg-[#1E1919] dark:bg-slate-800">
        <div className="p-10 flex flex-col bg-[#282929] dark:bg-slate-800 text-white space-y-5">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">
            Welcome to Nebula Drive.
            <br />
            <br />
            Storing everything for you and your business needs. All in one place.
          </h1>
          <p>
            Enhance your personal storage with Nebula Drive, offering a simple and efficent way 
            to upload, organize, and access files from anywhere.
            Securely store important documents and media, and experience the convenience of easy
            file management and sharing in one centralized solution.
          </p>

          <Link href="/dashboard" className="flex cursor-pointer bg-blue-500 hover:bg-blue-400 p-2 md:p-5 w-fit">
            <h2 className="font-semibold">Try it for free!</h2>
            <ArrowRight className="ml-3 sm:ml-7 md:ml-9"/>
          </Link>
        </div>
        <div className="bg-[#1E1919] dark:bg-slate-800 h-full p-10">
          <video autoPlay loop muted className="rounded-lg">
            <source src="https://aem.dropbox.com/cms/content/dam/dropbox/warp/en-us/overview/lp-header-graphite200-1920x1080.mp4" />
              Your Browser does not support the video tag
          </video>
        </div>
      </section>
    </main>
  );
}
