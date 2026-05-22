import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardApplyForm } from "@/components/card-apply-form";
import { CardDisplay } from "@/components/card-display";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "My Card — NexaBank" };

const MIN_BALANCE = 1000; // $10.00 in cents

export default async function CardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [account, card] = await Promise.all([
    prisma.account.findUnique({ where: { userId: session.user.id } }),
    prisma.card.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!account) redirect("/login");

  // Check if the user has completed at least one debit/withdrawal transaction
  const hasCompletedDebit = !!(await prisma.transaction.findFirst({
    where: {
      accountId: account.id,
      type: { in: ["DEBIT", "WITHDRAWAL"] },
    },
  }));

  // If card exists and user now has a completed debit, activate it
  if (card && card.status === "PENDING" && hasCompletedDebit) {
    await prisma.card.update({
      where: { id: card.id },
      data:  { status: "ACTIVE" },
    });
    card.status = "ACTIVE";
  }

  return (
    <div className="min-h-screen bg-[#f0f7f4] p-6 lg:p-8">
      <div className="max-w-md">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-[#0f2419]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            My Card
          </h1>
          <p className="text-[#6a8c7a] text-sm mt-1">
            {card ? "Manage your NexaBank card" : "Apply for your NexaBank card"}
          </p>
        </div>

        <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm p-6">

          {card ? (
            <CardDisplay
              card={card}
              holderName={session.user.name}
              hasCompletedDebit={hasCompletedDebit}
            />
          ) : (
            <>
              {/* No card yet */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                     style={{ background: "linear-gradient(135deg, #1a6648, #3daa7a)" }}>
                  <CreditCard className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-[16px] font-semibold text-[#0f2419]"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                  Get your NexaBank card
                </h2>
                <p className="text-[12px] text-[#6a8c7a] mt-2 leading-relaxed max-w-xs">
                  Choose between a debit or credit card. Your card will be issued instantly and activated after your first transfer.
                </p>
              </div>

              <CardApplyForm
                balance={account.balance}
                currency={account.currency}
                minBalance={MIN_BALANCE}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
}
