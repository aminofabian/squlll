import { tp } from "@/lib/portal-tokens";

/** Route-level skeleton shown while a student page's client data resolves. */
export default function StudentLoading() {
  return (
    <div className={tp.page}>
      <div className={tp.stack}>
        <div className="space-y-3">
          <div className="tp-skeleton h-2.5 w-20 rounded-full" />
          <div className="tp-skeleton h-10 w-2/3 max-w-md rounded-xl" />
          <div className="tp-skeleton h-3.5 w-1/2 max-w-sm rounded-full" />
        </div>
        <div className="tp-skeleton h-24 w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="tp-skeleton h-[84px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
