"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, MapPin, FileText, Lock,
  Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isVerified: boolean;
  user: { name: string; email: string };
  kyc: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    idType: string;
    idNumber: string;
  } | null;
}

type Status = "idle" | "loading" | "success" | "error";

export function SettingsForm({ isVerified, user, kyc }: Props) {
  // ── Personal details state (pre-KYC only) ──
  const [name,  setName]  = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Status ──
  const [detailsStatus,  setDetailsStatus]  = useState<Status>("idle");
  const [passwordStatus, setPasswordStatus] = useState<Status>("idle");
  const [detailsError,   setDetailsError]   = useState<string | null>(null);
  const [passwordError,  setPasswordError]  = useState<string | null>(null);

  const router = useRouter();

  const inputBase = "w-full px-4 py-3 rounded-[12px] border text-[13px] outline-none transition-all font-sans";
  const inputActive = `${inputBase} bg-white border-[#c8dfd5] text-[#0f2419] focus:border-[#4daa80] focus:ring-2 focus:ring-[#4daa80]/20`;
  const inputLocked = `${inputBase} bg-[#e4f2ec] border-[#c8dfd5] text-[#6a8c7a] cursor-not-allowed select-none`;
  const labelClass = "block text-[9px] font-semibold tracking-[0.18em] uppercase text-[#6a8c7a] mb-1.5";

  // ── Save personal details ──
  const saveDetails = async () => {
    setDetailsStatus("loading");
    setDetailsError(null);
    try {
      const res = await fetch("/api/settings/details", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email }),
      });
      const json = await res.json();
      if (!res.ok) { setDetailsError(json.error ?? "Failed to save."); setDetailsStatus("error"); return; }
      setDetailsStatus("success");
      router.refresh();
      setTimeout(() => setDetailsStatus("idle"), 3000);
    } catch {
      setDetailsError("Network error. Please try again.");
      setDetailsStatus("error");
    }
  };

  // ── Save password ──
  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordStatus("error");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      setPasswordStatus("error");
      return;
    }
    setPasswordStatus("loading");
    setPasswordError(null);
    try {
      const res = await fetch("/api/settings/password", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) { setPasswordError(json.error ?? "Failed to update password."); setPasswordStatus("error"); return; }
      setPasswordStatus("success");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordStatus("idle"), 3000);
    } catch {
      setPasswordError("Network error. Please try again.");
      setPasswordStatus("error");
    }
  };

  const idTypeLabel: Record<string, string> = {
    PASSPORT:        "🛂 Passport",
    NATIONAL_ID:     "🪪 National ID Card",
    DRIVERS_LICENSE: "🚗 Driver's License",
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ══ SECTION 1: Personal Details ══ */}
      <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d8ede6]">
          <div className="w-8 h-8 rounded-[10px] bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#1e7a52]" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-[#0f2419]"
             style={{ fontFamily: "'Playfair Display', serif" }}>
            Personal Details
          </p>
          {isVerified && (
            <span className="ml-auto flex items-center gap-1 text-[9px] font-bold tracking-[0.1em] uppercase text-[#0f7a6e]">
              <ShieldCheck className="w-3 h-3" /> Locked
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            {isVerified ? (
              <div className={inputLocked}>{kyc?.fullName ?? user.name}</div>
            ) : (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className={inputActive}
              />
            )}
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a8c7a]" />
              {isVerified ? (
                <div className={cn(inputLocked, "pl-9")}>{user.email}</div>
              ) : (
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="your@email.com"
                  className={cn(inputActive, "pl-9")}
                />
              )}
            </div>
          </div>

          {/* Save button — pre-KYC only */}
          {!isVerified && (
            <>
              {detailsError && (
                <div className="flex items-center gap-2 text-[11px] text-[#b52b3a] bg-[#faeef0] border border-[#e8b8be] rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{detailsError}
                </div>
              )}
              <button
                onClick={saveDetails}
                disabled={detailsStatus === "loading" || detailsStatus === "success"}
                className={cn(
                  "w-full py-3 rounded-[12px] text-[12px] font-bold tracking-[0.06em] uppercase transition-all flex items-center justify-center gap-2",
                  detailsStatus === "success"
                    ? "bg-[#edf7f5] border border-[#a8dbd4] text-[#0f7a6e]"
                    : "bg-[#1e7a52] hover:bg-[#155c3a] text-white shadow-sm active:scale-[0.98]"
                )}
              >
                {detailsStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {detailsStatus === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {detailsStatus === "loading" ? "Saving…"
                  : detailsStatus === "success" ? "Saved!"
                  : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══ SECTION 2: Address (from KYC) ══ */}
      <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d8ede6]">
          <div className="w-8 h-8 rounded-[10px] bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-[#1e7a52]" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-[#0f2419]"
             style={{ fontFamily: "'Playfair Display', serif" }}>
            Residential Address
          </p>
          {isVerified && (
            <span className="ml-auto flex items-center gap-1 text-[9px] font-bold tracking-[0.1em] uppercase text-[#0f7a6e]">
              <ShieldCheck className="w-3 h-3" /> Locked
            </span>
          )}
        </div>

        <div className="p-5">
          <label className={labelClass}>Address</label>
          {kyc ? (
            <div className={cn(inputLocked, "h-auto min-h-[80px] leading-relaxed whitespace-pre-wrap")}>
              {kyc.address}
            </div>
          ) : (
            <div className={cn(inputLocked, "text-[#c8dfd5] italic")}>
              No address on file — complete KYC to populate this field.
            </div>
          )}
        </div>
      </div>

      {/* ══ SECTION 3: ID Document (from KYC, always locked) ══ */}
      {kyc && (
        <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d8ede6]">
            <div className="w-8 h-8 rounded-[10px] bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-[#1e7a52]" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold text-[#0f2419]"
               style={{ fontFamily: "'Playfair Display', serif" }}>
              Identity Document
            </p>
            <span className="ml-auto flex items-center gap-1 text-[9px] font-bold tracking-[0.1em] uppercase text-[#0f7a6e]">
              <ShieldCheck className="w-3 h-3" /> Locked
            </span>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className={labelClass}>ID Type</label>
              <div className={inputLocked}>{idTypeLabel[kyc.idType] ?? kyc.idType}</div>
            </div>
            <div>
              <label className={labelClass}>ID Number</label>
              <div className={cn(inputLocked, "font-mono tracking-[0.12em] uppercase")}>{kyc.idNumber}</div>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <div className={inputLocked}>
                {new Date(kyc.dateOfBirth).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SECTION 4: Change Password (always available) ══ */}
      <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d8ede6]">
          <div className="w-8 h-8 rounded-[10px] bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-[#1e7a52]" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-[#0f2419]"
             style={{ fontFamily: "'Playfair Display', serif" }}>
            Change Password
          </p>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Current password */}
          <div>
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={cn(inputActive, "pr-10")}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a8c7a] hover:text-[#2d5042] transition-colors">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={cn(inputActive, "pr-10")}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a8c7a] hover:text-[#2d5042] transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={cn(inputActive, "pr-10")}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a8c7a] hover:text-[#2d5042] transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {newPassword.length > 0 && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(level => {
                const strength =
                  newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword) ? 4
                  : newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 3
                  : newPassword.length >= 8 ? 2
                  : 1;
                const color = strength >= 3 ? "bg-[#0f7a6e]" : strength === 2 ? "bg-[#c47a00]" : "bg-[#b52b3a]";
                return (
                  <div key={level} className={cn("h-1 flex-1 rounded-full transition-all",
                    level <= strength ? color : "bg-[#d8ede6]")} />
                );
              })}
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-2 text-[11px] text-[#b52b3a] bg-[#faeef0] border border-[#e8b8be] rounded-xl px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{passwordError}
            </div>
          )}

          <button
            onClick={savePassword}
            disabled={passwordStatus === "loading" || passwordStatus === "success" || !currentPassword || !newPassword || !confirmPassword}
            className={cn(
              "w-full py-3 rounded-[12px] text-[12px] font-bold tracking-[0.06em] uppercase transition-all flex items-center justify-center gap-2",
              passwordStatus === "success"
                ? "bg-[#edf7f5] border border-[#a8dbd4] text-[#0f7a6e]"
                : "bg-[#1e7a52] hover:bg-[#155c3a] text-white shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {passwordStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {passwordStatus === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {passwordStatus === "loading" ? "Updating…"
              : passwordStatus === "success" ? "Password Updated!"
              : "Update Password"}
          </button>
        </div>
      </div>

    </div>
  );
}
