"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";

export default function AddRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "STANDARD",
    price: "",
    capacity: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          capacity: parseInt(formData.capacity)
        }),
        signal: controller.signal
      });

      if (res.ok) {
        toast.success("Room Added", { description: `Room ${formData.roomNumber} has been added to inventory.` });
        router.push("/dashboard/rooms");
        router.refresh();
      } else {
        toast.error("Error", { description: "Failed to add room. Please check the details." });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Request Timeout", { description: "The server is taking too long to add the room." });
      } else {
        toast.error("System Error");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };


  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Room</CardTitle>
          <CardDescription>Expand your hotel inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Number</label>
              <Input
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. 101"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={loading}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g. 2"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price per Night ($)</label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              Create Room
            </Button>

            <Button variant="ghost" type="button" className="w-full" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}