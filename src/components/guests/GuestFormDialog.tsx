"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { GuestRow } from "./GuestTable";

const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  nationality: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vip_status: z.enum(["none", "silver", "gold", "platinum", "diamond"]),
  gender: z.enum(["male", "female", "other"]).optional(),
  marketing_opt_in: z.boolean(),
  notes: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestFormDialogProps {
  open: boolean;
  guest: GuestRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function GuestFormDialog({ open, guest, onClose, onSuccess }: GuestFormDialogProps) {
  const isEdit = !!guest;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      vip_status: "none",
      marketing_opt_in: true,
    },
  });

  useEffect(() => {
    if (guest) {
      reset({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        nationality: guest.nationality ?? "",
        city: guest.city ?? "",
        country: guest.country ?? "",
        vip_status: guest.vip_status as GuestFormData["vip_status"],
        marketing_opt_in: guest.marketing_opt_in,
        notes: "",
      });
    } else {
      reset({ vip_status: "none", marketing_opt_in: true });
    }
  }, [guest, reset]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const onSubmit = async (data: GuestFormData) => {
    try {
      if (isEdit && guest) {
        const { error } = await supabase
          .from("guests")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("guest_id", guest.guest_id);
        if (error) throw error;
        toast.success("Guest updated successfully");
      } else {
        const { error } = await supabase.from("guests").insert([data]);
        if (error) throw error;
        toast.success("Guest added successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-azure flex items-center justify-center shadow-azure">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">{isEdit ? "Edit Guest" : "Add New Guest"}</h2>
                    <p className="text-xs text-slate-500">{isEdit ? `Editing ${guest?.first_name} ${guest?.last_name}` : "Create a new guest profile"}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {/* Form */}
              <div className="overflow-y-auto flex-1 p-5">
                <form id="guest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">First Name *</Label>
                      <Input {...register("first_name")} className="h-9 rounded-xl border-slate-200" placeholder="James" />
                      {errors.first_name && <p className="text-xs text-rose-500 mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Last Name *</Label>
                      <Input {...register("last_name")} className="h-9 rounded-xl border-slate-200" placeholder="Wilson" />
                      {errors.last_name && <p className="text-xs text-rose-500 mt-1">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Email *</Label>
                    <Input {...register("email")} type="email" className="h-9 rounded-xl border-slate-200" placeholder="guest@email.com" />
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Phone *</Label>
                    <Input {...register("phone")} className="h-9 rounded-xl border-slate-200" placeholder="+92 300 1234567" />
                    {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">VIP Status</Label>
                      <Select value={watch("vip_status")} onValueChange={(v) => setValue("vip_status", v as GuestFormData["vip_status"])}>
                        <SelectTrigger className="h-9 rounded-xl border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Standard</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="diamond">Diamond</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Gender</Label>
                      <Select value={watch("gender") ?? ""} onValueChange={(v) => setValue("gender", v as GuestFormData["gender"])}>
                        <SelectTrigger className="h-9 rounded-xl border-slate-200">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">City</Label>
                      <Input {...register("city")} className="h-9 rounded-xl border-slate-200" placeholder="Karachi" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Country</Label>
                      <Input {...register("country")} className="h-9 rounded-xl border-slate-200" placeholder="Pakistan" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Nationality</Label>
                    <Input {...register("nationality")} className="h-9 rounded-xl border-slate-200" placeholder="Pakistani" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Notes</Label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      placeholder="Special preferences or notes..."
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={watch("marketing_opt_in")}
                      onChange={(e) => setValue("marketing_opt_in", e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <Label htmlFor="marketing" className="text-sm text-slate-600 cursor-pointer">
                      Marketing opt-in (receive promotional emails)
                    </Label>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-10">Cancel</Button>
                <Button
                  type="submit"
                  form="guest-form"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl h-10 gradient-azure text-white border-0 shadow-azure"
                >
                  {isSubmitting ? (
                    <><Loader2 size={14} className="animate-spin mr-2" />Saving...</>
                  ) : (
                    isEdit ? "Update Guest" : "Add Guest"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}