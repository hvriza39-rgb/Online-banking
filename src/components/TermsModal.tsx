"use client";

import { useState } from "react";
import { X, ScrollText, ChevronDown } from "lucide-react";

export default function TermsModal({ onAccept }: { onAccept: () => void }) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setScrolled(true);
    }
  };

  const accept = () => { setOpen(false); onAccept(); };

  return (
    <>
      {/* Trigger — inline link for the registration form */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[#1e7a52] font-semibold underline underline-offset-2 hover:text-[#155c3a] transition-colors"
      >
        Terms & Conditions
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0f2419]/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#f2f9f6] w-full sm:max-w-lg sm:rounded-[24px] rounded-t-[24px] shadow-2xl flex flex-col max-h-[90vh]">

            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[#c8dfd5]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ede6] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[11px] bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center">
                  <ScrollText className="w-4 h-4 text-[#1e7a52]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#1e7a52]"
                     style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    NexaBank
                  </p>
                  <p className="text-[14px] font-semibold text-[#0f2419]"
                     style={{ fontFamily: "'Playfair Display', serif" }}>
                    Electronic Disclosure Consent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center hover:bg-[#d8ede6] transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-[#2d5042]" />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-[#2d5042]"
            >
              {/* Section 1 */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1e7a52] mb-2">
                  1. Covered Communications
                </p>
                <p className="text-[12px] leading-relaxed text-[#4a6b5a] mb-2">
                  By clicking <span className="font-semibold text-[#0f2419]">"I Agree,"</span> you
                  consent to receive electronic versions of all required disclosures and notices
                  regarding your account, including:
                </p>
                <div className="bg-[#e4f2ec] border border-[#c8dfd5] rounded-[12px] px-4 py-3 space-y-1.5">
                  {[
                    "Internet Banking and Bill Payment Agreement updates",
                    "Monthly account statements and change-in-terms notices",
                    "Fee changes and privacy/security notices",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e7a52] mt-1.5 flex-shrink-0" />
                      <p className="text-[12px] text-[#2d5042]">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#6a8c7a] mt-2 leading-relaxed italic">
                  Note: Enrolling in online banking requires agreeing to electronic delivery. You may
                  request a free paper copy of any electronic disclosure by contacting us.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#d8ede6]" />

              {/* Section 2 */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1e7a52] mb-2">
                  2. System Requirements
                </p>
                <p className="text-[12px] leading-relaxed text-[#4a6b5a] mb-2">
                  To access and retain your electronic disclosures, you will need:
                </p>
                <div className="bg-[#e4f2ec] border border-[#c8dfd5] rounded-[12px] px-4 py-3 space-y-1.5">
                  {[
                    "An active internet connection and a current web browser supporting 128-bit encryption.",
                    "An active external email address to receive notifications.",
                    "A printer or sufficient electronic storage space to save copies.",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e7a52] mt-1.5 flex-shrink-0" />
                      <p className="text-[12px] text-[#2d5042]">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#6a8c7a] mt-2 leading-relaxed">
                  We will notify you 30 days in advance if any material changes are made to these
                  system requirements.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#d8ede6]" />

              {/* Section 3 */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1e7a52] mb-2">
                  3. Managing Your Preferences
                </p>
                <div className="space-y-3">
                  <div className="bg-[#e4f2ec] border border-[#c8dfd5] rounded-[12px] px-4 py-3">
                    <p className="text-[11px] font-bold text-[#0f2419] mb-1">Withdraw Consent</p>
                    <p className="text-[12px] text-[#4a6b5a] leading-relaxed">
                      You can opt out of electronic disclosures at any time without fee penalties.
                      Send a secure message through your Online Banking portal or visit a branch.
                    </p>
                  </div>
                  <div className="bg-[#e4f2ec] border border-[#c8dfd5] rounded-[12px] px-4 py-3">
                    <p className="text-[11px] font-bold text-[#0f2419] mb-1">Address Changes</p>
                    <p className="text-[12px] text-[#4a6b5a] leading-relaxed">
                      It is your responsibility to keep your contact info current. Update your email
                      address via the "User Services" menu online, or by calling or visiting a
                      NexaBank branch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#d8ede6]" />

              {/* Section 4 */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1e7a52] mb-2">
                  4. Acceptance
                </p>
                <p className="text-[12px] leading-relaxed text-[#4a6b5a]">
                  By clicking <span className="font-semibold text-[#0f2419]">"I Agree,"</span> you
                  confirm that your system meets the requirements above, you can access electronic
                  documents, and you consent to receive disclosures electronically.
                </p>
                <p className="text-[12px] leading-relaxed text-[#4a6b5a] mt-2">
                  If you select <span className="font-semibold text-[#0f2419]">"Cancel,"</span> you
                  will not be able to complete your enrollment online. However, you can still enroll
                  in person at any NexaBank branch to receive paper disclosures.
                </p>
              </div>

              {/* Bottom padding so last content isn't hidden behind button */}
              <div className="h-2" />
            </div>

            {/* Scroll hint */}
            {!scrolled && (
              <div className="flex items-center justify-center gap-1.5 py-2 text-[#6a8c7a]">
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                <span className="text-[10px] font-semibold tracking-[0.1em] uppercase">
                  Scroll to read all
                </span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#d8ede6] flex gap-2 flex-shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 rounded-[12px] bg-[#e4f2ec] border border-[#c8dfd5] text-[12px] font-semibold text-[#2d5042] hover:bg-[#d8ede6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={accept}
                className="flex-[2] py-3 rounded-[12px] bg-[#1e7a52] text-white text-[13px] font-bold tracking-[0.04em] hover:bg-[#155c3a] active:scale-[0.98] transition-all"
              >
                I Agree
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
