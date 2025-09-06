import Sidebar from "@/src/components/site/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-20 rounded-xl border border-neutral-200 p-3">
          <Sidebar />
        </div>
      </aside>
      {/* Content + mobile nav */}
      <div className="flex-1 min-w-0 pb-10">{children}</div>
    </div>
  );
}
