"use client";

import Result from "@/components/analyzer/result";
import Upload from "@/components/analyzer/upload";
import { useState } from "react";

export default function AnalyzePageTest() {
    const [data, setData] = useState(null);

    return (
        <div className="p-50">
            <h1>AI Simplifier</h1>
            <Upload onResult={setData} />
            <Result data={data} />
        </div>
    );
}
