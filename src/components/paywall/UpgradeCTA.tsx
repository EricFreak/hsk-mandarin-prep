"use client";

import { useState } from "react";
import UpgradeModal from "@/components/paywall/UpgradeModal";

type UpgradeCTAProps = {
  title: string;
  description: string;
  className?: string;
};

export default function UpgradeCTA({
  title,
  description,
  className = "",
}: UpgradeCTAProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={`rounded-lg border border-amber-200 bg-amber-50 p-6 text-center ${className}`}
      >
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <button
          type="button"
          className="mt-4 inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => setModalOpen(true)}
        >
          Upgrade to Pro
        </button>
      </div>

      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
