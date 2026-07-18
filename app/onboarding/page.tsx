"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function OnboardingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customAmount, setCustomAmount] = useState("");

    // Check if user already has a plan
    useEffect(() => {
        async function checkPlan() {
            if (user) {
                const docRef = doc(db, "users", user.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().storageLimit) {
                    router.push("/dashboard");
                }
            }
        }
        checkPlan();
    }, [user, router]);

    const setStorageLimit = async (limit: number) => {
        if (!user) return;
        setLoading(true);
        try {
            // Check if document exists first, if not create it (though usually created on signup logic if exists)
            // We'll use setDoc with merge: true to be safe
            await setDoc(doc(db, "users", user.id), {
                storageLimit: limit,
                // Initialize other fields if this is first touch
                email: user.primaryEmailAddress?.emailAddress,
                fullName: user.fullName,
            }, { merge: true });

            toast.success("Storage plan set successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error setting storage limit:", error);
            toast.error("Failed to set storage plan.");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(customAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        if (amount > 10000) {
            toast.error("Please enter an amount less than 10,000 GB.");
            return;
        }
        // Convert GB to Bytes
        setStorageLimit(amount * 1024 * 1024 * 1024);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Welcome to CloudCube</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Choose your storage plan to get started.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {/* 30 GB Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic</CardTitle>
                            <CardDescription>Perfect for personal use.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">30 GB</div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => setStorageLimit(30 * 1024 * 1024 * 1024)} disabled={loading}>
                                Select 30 GB
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* 50 GB Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pro</CardTitle>
                            <CardDescription>More space for your files.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">50 GB</div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="secondary" onClick={() => setStorageLimit(50 * 1024 * 1024 * 1024)} disabled={loading}>
                                Select 50 GB
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Custom Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom</CardTitle>
                            <CardDescription>Enter your needs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCustomSubmit} className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="Amount (GB)"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline" onClick={handleCustomSubmit} disabled={loading || !customAmount}>
                                Set Custom
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
