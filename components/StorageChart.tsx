"use client";

import { Progress } from "@/components/ui/progress";
import prettyBytes from "pretty-bytes";

type Props = {
    usedBytes: number;
    limitBytes: number;
};

function StorageChart({ usedBytes, limitBytes }: Props) {
    const percentage = limitBytes > 0 ? Math.min((usedBytes / limitBytes) * 100, 100) : 0;

    return (
        <div className="space-y-2 p-4 border rounded-md shadow-sm bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Storage Usage</h3>
                <span className="text-xs text-muted-foreground">
                    {prettyBytes(usedBytes)} of {prettyBytes(limitBytes)} used
                </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
                {percentage.toFixed(1)}% full
            </p>
        </div>
    );
}

export default StorageChart;
