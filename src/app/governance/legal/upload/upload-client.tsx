"use client";

import Result from "@/components/analyzer/result";
import Upload from "@/components/analyzer/upload";
import { useState } from "react";

export default function UploadClient({
    lockedLocation,
}: {
    lockedLocation?: string | null;
}) {
    const [analysisResult, setAnalysisResult] = useState(null);

    return (
        <main className="p-30">
            {!analysisResult ? (
                <Upload
                    onResult={(res) => setAnalysisResult(res)}
                    lockedLocation={lockedLocation}
                />
            ) : (
                <Result data={analysisResult} />
            )}
        </main>
    );
}
