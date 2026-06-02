"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateUserCategory,
  updateUserPlan,
  resetOnboarding,
} from "./actions";

type Props = {
  userId: string;
  category: string;
  plan: string;
  onboarded: boolean;
};

export function UserEditForms({ userId, category, plan, onboarded }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Parameters<typeof updateUserCategory>[1];
    startTransition(async () => {
      await updateUserCategory(userId, next);
      router.refresh();
    });
  }
  function onPlanChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Parameters<typeof updateUserPlan>[1];
    startTransition(async () => {
      await updateUserPlan(userId, next);
      router.refresh();
    });
  }
  function onReset() {
    if (!confirm("Reset onboarding for this user? They'll be sent back through the quiz.")) {
      return;
    }
    startTransition(async () => {
      await resetOnboarding(userId);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <label className="block">
        <span className="block text-[12px] font-medium text-ink-700 mb-1.5">
          Category
        </span>
        <select
          defaultValue={category}
          onChange={onCategoryChange}
          disabled={pending}
          className="w-full h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        >
          <option value="starter">Starter Creator</option>
          <option value="growth">Growth Creator</option>
          <option value="monetization">Monetization Creator</option>
          <option value="scale">Scale Creator</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-[12px] font-medium text-ink-700 mb-1.5">
          Plan
        </span>
        <select
          defaultValue={plan}
          onChange={onPlanChange}
          disabled={pending}
          className="w-full h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        >
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
      </label>

      <div className="block">
        <span className="block text-[12px] font-medium text-ink-700 mb-1.5">
          Onboarding
        </span>
        <button
          type="button"
          onClick={onReset}
          disabled={pending || !onboarded}
          className="inline-flex w-full items-center justify-center h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-[13px] font-medium text-ink-900 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {onboarded ? "Reset onboarding" : "Not yet onboarded"}
        </button>
      </div>
    </div>
  );
}
