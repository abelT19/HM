"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Plus, Utensils, Edit3, Trash2, Camera, CheckCircle2, Archive, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number | string;
    category: string;
    image_url: string;
    is_active: boolean;
};

export default function AdminMenuPage() {
    const { data: session } = useSession();
    const isAdmin = (session as any)?.user?.role === "ADMIN";
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Traditional",
        image: null as File | null,
        is_active: true
    });

    const fetchMenu = async () => {
        try {
            const res = await fetch("/api/admin/menu");
            const data = await res.json();
            setMenuItems(data);
        } catch (error) {
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleAddDish = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("category", formData.category);
        if (formData.image) data.append("image", formData.image);

        try {
            const res = await fetch("/api/admin/menu", {
                method: "POST",
                body: data
            });
            if (res.ok) {
                toast.success("Dish added successfully");
                setIsAddModalOpen(false);
                fetchMenu();
                setFormData({ name: "", description: "", price: "", category: "Traditional", image: null, is_active: true });
            }
        } catch (error) {
            toast.error("Error adding dish");
        }
    };

    const handleEditDish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDish) return;

        const data = new FormData();
        data.append("id", selectedDish.id);
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("category", formData.category);
        data.append("is_active", String(formData.is_active));
        if (formData.image) data.append("image", formData.image);

        try {
            const res = await fetch("/api/admin/menu", {
                method: "PATCH",
                body: data
            });
            if (res.ok) {
                toast.success("Dish updated successfully");
                setIsEditModalOpen(false);
                fetchMenu();
            }
        } catch (error) {
            toast.error("Error updating dish");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "archive" : "restore";
        if (!confirm(`Are you sure you want to ${action} this dish?`)) return;

        try {
            const res = await fetch("/api/admin/menu/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, targetStatus: currentStatus ? 0 : 1 })
            });
            if (res.ok) {
                toast.success(`Dish ${currentStatus ? 'archived' : 'restored'} successfully`);
                fetchMenu();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this dish? This cannot be undone.")) return;

        try {
            const res = await fetch("/api/admin/menu", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, archiveOnly: false })
            });
            if (res.ok) {
                toast.success("Dish deleted permanently");
                fetchMenu();
            }
        } catch (error) {
            toast.error("Error deleting dish");
        }
    };

    const openEditModal = (dish: MenuItem) => {
        setSelectedDish(dish);
        setFormData({
            name: dish.name,
            description: dish.description,
            price: dish.price.toString(),
            category: dish.category,
            image: null,
            is_active: dish.is_active
        });
        setIsEditModalOpen(true);
    };

    const activeItems = menuItems.filter(item => item.is_active);
    const archivedItems = menuItems.filter(item => !item.is_active);

    return (
        <div className="relative z-10 p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-12 flex justify-between items-center bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-xl">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Palais Menu Management</h1>
                    <p className="text-slate-600 mt-2 italic text-lg font-light">Curate the finest flavors for our distinguished guests.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Dish
                </Button>
            </header>

            {/* Active Menu Section */}
            <section className="mb-20">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <div className="h-8 w-1 bg-amber-500 rounded-full" />
                    Palais Menu (Active)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-slate-400 font-serif italic text-2xl">Loading items...</div>
                    ) : activeItems.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-400 italic">No active items in the menu.</div>
                    ) : activeItems.map((item) => (
                        <DishCard key={item.id} item={item} onStatusToggle={handleToggleStatus} onEdit={openEditModal} isAdmin={isAdmin} />
                    ))}
                </div>
            </section>

            {/* Archived Menu Section */}
            {archivedItems.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-slate-400 mb-8 flex items-center gap-3">
                        <div className="h-8 w-1 bg-slate-300 rounded-full" />
                        Archived Menu Items
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 grayscale-[0.5]">
                        {archivedItems.map((item) => (
                            <DishCard key={item.id} item={item} onStatusToggle={handleToggleStatus} onEdit={openEditModal} isAdmin={isAdmin} isArchived />
                        ))}
                    </div>
                </section>
            )}

            {/* Modals */}
            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={isAddModalOpen ? "Add New Culinary Creation" : "Refine Dish Details"}>
                <form onSubmit={isAddModalOpen ? handleAddDish : handleEditDish} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Dish Name</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g. Traditional Doro Wat"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Price (ETB)</Label>
                            <Input
                                required
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="rounded-xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-primary/20"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Category</Label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium"
                        >
                            <option value="Traditional">Traditional Ethiopian</option>
                            <option value="Breakfast">Royal Breakfast</option>
                            <option value="Appetizers">Appetizers</option>
                            <option value="Desserts">Sweet Indulgences</option>
                            <option value="Vegan">Vegan Specialties</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Dish Description</Label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-4 rounded-xl bg-slate-50 border-none h-24 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                            placeholder="Describe the flavors and tradition..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Dish Image</Label>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl relative group">
                            <Camera className="w-6 h-6 text-slate-400" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="text-sm text-slate-500 font-medium">
                                {formData.image ? formData.image.name : "Capture or Upload Photo"}
                            </span>
                        </div>
                    </div>

                    {isEditModalOpen && (
                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                                id="is_active"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-600">Currently Visible to Guests</label>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button className="w-full py-7 rounded-2xl text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                            {isAddModalOpen ? "Add Dish to Menu" : "Commit Changes"}
                            <CheckCircle2 className="w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function DishCard({ item, onStatusToggle, onEdit, isAdmin, isArchived }: any) {
    return (
        <Card className="group overflow-hidden border-none glass-card relative h-full flex flex-col shadow-2xl transition-all duration-500 hover:shadow-primary/20">
            <div className="h-56 relative overflow-hidden bg-slate-100">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = "";
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'/%3E%3Cpath d='M7 2v20'/%3E%3Cpath d='M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'/%3E%3C/svg%3E";
                        }}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <Utensils className="w-12 h-12 opacity-20" />
                    </div>
                )}
                <div className="absolute top-4 right-4 z-20">
                    <Badge variant={item.is_active ? "success" : "secondary"} className="shadow-lg uppercase tracking-widest text-[10px] bg-white/90 backdrop-blur-md border-none">
                        {item.is_active ? "Active" : "Archived"}
                    </Badge>
                </div>
            </div>

            <CardHeader className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">{item.category}</Badge>
                    <span className="text-2xl font-bold text-primary">{item.price} ETB</span>
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-slate-900 line-clamp-1">{item.name}</CardTitle>
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic">{item.description}</p>
            </CardContent>

            <CardFooter className="border-t border-slate-50 pt-6 gap-3 flex-col sm:flex-row">
                <Button
                    variant="ghost"
                    className="flex-1 rounded-xl hover:bg-primary hover:text-white transition-all group"
                    onClick={() => onEdit(item)}
                >
                    <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Edit
                </Button>
                {isAdmin && (
                    <Button
                        variant={isArchived ? "default" : "outline"}
                        className={`flex-1 rounded-xl ${isArchived ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        onClick={() => onStatusToggle(item.id, item.is_active)}
                    >
                        {isArchived ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Restore
                            </>
                        ) : (
                            <>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
