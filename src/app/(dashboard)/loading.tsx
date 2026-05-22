import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0f7f4]">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-pulse">
          <Image
            src="/nexabank-logo.svg"
            alt="NexaBank"
            width={180}
            height={56}
            priority
          />
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1e7a52] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#1e7a52] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#1e7a52] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
