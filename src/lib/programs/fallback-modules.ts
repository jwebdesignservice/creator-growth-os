import type { Module } from "@/components/programs/curriculum-accordion";

/**
 * Mock curriculum used when the lessons table is empty. Mirrors the
 * Influencer Blueprint structure so the detail page always has a
 * realistic-looking accordion to render in dev.
 */
export const FALLBACK_MODULES: Module[] = [
  {
    number: 1,
    title: "Foundation: Know Your Brand",
    lessons: [
      {
        slug: "defining-niche-sweet-spot",
        title: "Defining Your Niche & Sweet Spot",
        duration: "08:12",
        status: "completed",
      },
      {
        slug: "your-story-differentiator",
        title: "Your Story, Your Differentiator",
        duration: "10:34",
        status: "completed",
      },
      {
        slug: "brand-values-positioning",
        title: "Brand Values & Positioning",
        duration: "09:15",
        status: "current",
      },
      {
        slug: "ideal-audience-deep-dive",
        title: "Ideal Audience Deep Dive",
        duration: "07:50",
        status: "todo",
      },
    ],
  },
  {
    number: 2,
    title: "Content That Connects",
    lessons: [
      { slug: "content-pillars-that-work", title: "Content Pillars That Work", duration: "15:30", status: "todo" },
      { slug: "hooks-that-stop-the-scroll", title: "Hooks That Stop the Scroll", duration: "11:20", status: "todo" },
      { slug: "story-formats-that-convert", title: "Story Formats That Convert", duration: "12:05", status: "todo" },
      { slug: "captions-that-convert", title: "Engaging Captions That Convert", duration: "08:40", status: "todo" },
      { slug: "thumbnails-and-covers", title: "Thumbnails & Covers", duration: "06:55", status: "todo" },
      { slug: "first-three-seconds", title: "The First 3 Seconds", duration: "09:30", status: "todo" },
    ],
  },
  {
    number: 3,
    title: "Consistency & Audience Growth",
    lessons: [
      { slug: "weekly-content-system", title: "Your Weekly Content System", duration: "14:10", status: "todo" },
      { slug: "batch-record-a-whole-week", title: "Batch Record a Whole Week", duration: "12:20", status: "todo" },
      { slug: "platform-performance", title: "How To Read Platform Performance", duration: "13:45", status: "todo" },
      { slug: "daily-engagement-loop", title: "The Daily Engagement Loop", duration: "09:50", status: "todo" },
      { slug: "trends-without-losing-self", title: "Riding Trends Without Losing Yourself", duration: "11:00", status: "todo" },
      { slug: "audience-feedback-loops", title: "Audience Feedback Loops", duration: "08:15", status: "todo" },
    ],
  },
  {
    number: 4,
    title: "Monetization & Brand Deals",
    lessons: [
      { slug: "monetization-readiness", title: "Monetization Readiness Score", duration: "10:00", status: "todo" },
      { slug: "build-a-media-kit", title: "Build a Media Kit That Wins", duration: "13:40", status: "todo" },
      { slug: "brand-outreach-templates", title: "Brand Outreach Templates", duration: "11:30", status: "todo" },
      { slug: "rates-pricing-negotiation", title: "Rates, Pricing & Negotiation", duration: "12:15", status: "todo" },
      { slug: "your-first-paid-brand-deal", title: "Your First Paid Brand Deal", duration: "10:45", status: "todo" },
      { slug: "brand-deals-pipeline", title: "Running a Brand Deals Pipeline", duration: "09:20", status: "todo" },
    ],
  },
  {
    number: 5,
    title: "Scaling, Systems & Advanced Strategies",
    bonus: true,
    pro_only: true,
    lessons: [
      { slug: "hire-first-editor", title: "Hiring Your First Editor", duration: "12:10", status: "locked" },
      { slug: "automate-scheduling", title: "Automating Scheduling & Replies", duration: "09:50", status: "locked" },
      { slug: "launching-products-services", title: "Launching Products & Services", duration: "14:30", status: "locked" },
      { slug: "agency-track", title: "The Agency Track for Creators", duration: "11:25", status: "locked" },
    ],
  },
];
