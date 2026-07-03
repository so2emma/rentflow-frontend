import Link from "next/link";
import Image from "next/image";

export function BrandingPanel() {
    return (
        <aside className="hidden lg:flex relative flex-col justify-between overflow-hidden p-12 text-white">
            <div className="absolute inset-0">
                <img
                    src="/images/screen.png"
                    alt="RentFlow"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="absolute inset-0 bg-[#1a2036]/90" />
            <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                    <Link href="/" className="mb-12 flex w-fit items-center gap-2">
                        <div className="flex items-center gap-stack-sm mb-4">
                              <span className="material-symbols-outlined text-white text-[24px] leading-none" aria-hidden="true">
                                real_estate_agent
                              </span>
                            <span className="text-title-lg font-bold text-white">RentFlow</span>
                        </div>
                    </Link>
                </div>
                <div>
                    <h1 className="max-w-md text-5xl font-bold leading-tight text-white">
                        Streamline your property ecosystem.
                    </h1>

                    <p className="mt-6 max-w-md text-lg text-slate-400">
                        Join thousands of property managers and tenants who have
                        simplified their financial operations with RentFlow's
                        institutional-grade platform.
                    </p>
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex gap-1">
                            <div className="h-8 w-8 rounded-full bg-slate-700" />
                            <div className="-ml-4 h-8 w-8 rounded-full bg-slate-700" />
                        </div>
                        <span className="text-sm">
            Trusted by 5,000+ landlords
          </span>
                    </div>

                </div>
            </div>
        </aside>
    );
}
