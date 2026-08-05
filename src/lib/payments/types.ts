export const FREE_TIER_BENEFITS = [
  "Full diagnosis — never counts against quotas",
  "Complete AI report, no truncation",
  "Full course outline with a one-time price",
  "A real, doable sample day",
  "Personalized previews of locked tasks",
] as const;

export const PRO_BENEFITS = [
  "One rate for every plan — coach, custom, or sprint",
  "No urgency premium, even for near exams",
  "Unused work credited when you replan",
  "Pay once for a defined amount of work",
] as const;

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
