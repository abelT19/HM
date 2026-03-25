import { Skeleton } from "@/components/ui/Skeleton";

export default function ReceptionLoading() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
