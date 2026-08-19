import { Skeleton } from "@/components/ui/skeleton";

export function MissionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-amber-500/20" />
          <Skeleton className="h-4 w-32 bg-amber-500/20" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full bg-slate-800" />
      </div>
      <Skeleton className="h-3 w-3/4 bg-slate-800" />
      <div className="flex items-center justify-between pt-2 border-t border-amber-500/10">
        <Skeleton className="h-6 w-24 rounded-lg bg-amber-500/15" />
        <Skeleton className="h-8 w-28 rounded-xl bg-amber-500/30" />
      </div>
    </div>
  );
}

export function HQHeroSkeleton() {
  return (
    <div className="rounded-3xl border-2 border-amber-500/30 bg-slate-950 p-4 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-amber-500/20" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 bg-amber-500/20" />
            <Skeleton className="h-3 w-24 bg-slate-800" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-full bg-amber-500/20" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        <Skeleton className="h-16 rounded-2xl bg-slate-900 border border-slate-800" />
        <Skeleton className="h-16 rounded-2xl bg-slate-900 border border-slate-800" />
        <Skeleton className="h-16 rounded-2xl bg-slate-900 border border-slate-800" />
        <Skeleton className="h-16 rounded-2xl bg-slate-900 border border-slate-800" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 rounded-2xl bg-slate-900/80 border border-amber-500/20"
          />
        ))}
      </div>
    </div>
  );
}

export function PackGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-5 space-y-4"
        >
          <Skeleton className="h-44 w-full rounded-xl bg-slate-950/80 border border-amber-500/10" />
          <Skeleton className="h-5 w-3/4 bg-amber-500/20" />
          <Skeleton className="h-3 w-1/2 bg-slate-800" />
          <Skeleton className="h-10 w-full rounded-xl bg-amber-500/25" />
        </div>
      ))}
    </div>
  );
}

export function ShopGridSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Skeleton className="h-9 w-24 rounded-xl bg-amber-500/20" />
        <Skeleton className="h-9 w-24 rounded-xl bg-slate-800" />
        <Skeleton className="h-9 w-24 rounded-xl bg-slate-800" />
        <Skeleton className="h-9 w-24 rounded-xl bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-5 space-y-4"
          >
            <Skeleton className="h-48 w-full rounded-xl bg-slate-950/80" />
            <Skeleton className="h-5 w-2/3 bg-amber-500/20" />
            <Skeleton className="h-10 w-full rounded-xl bg-amber-500/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-28 rounded-2xl bg-amber-500/10 border border-amber-500/20" />
        <Skeleton className="h-32 rounded-2xl bg-amber-500/20 border border-amber-500/30" />
        <Skeleton className="h-28 rounded-2xl bg-amber-500/10 border border-amber-500/20" />
      </div>
      <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full bg-amber-500/20" />
              <Skeleton className="h-4 w-32 bg-slate-800" />
            </div>
            <Skeleton className="h-4 w-20 bg-amber-500/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
