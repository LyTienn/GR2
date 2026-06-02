import { Outlet } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher"; 

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex w-full bg-slate-50">
            <div className="w-full lg:w-1/2 flex flex-col relative">
                
                <div className="absolute top-6 left-6 z-10 shadow-md rounded-lg">
                    <LanguageSwitcher className="flex items-center shrink-0 bg-slate-200/60 p-1 rounded-lg border border-slate-300/50" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Outlet />
                </div>
            </div>
            <div 
                className="hidden lg:block lg:w-1/2 bg-cover bg-center border-l border-slate-200"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')" }}
            >
                <div className="w-full h-full bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
                    <h1 className="text-white text-5xl font-extrabold tracking-widest drop-shadow-2xl">
                        Lybrary Is Still Alive
                    </h1>
                </div>
            </div>
        </div>
    );
}