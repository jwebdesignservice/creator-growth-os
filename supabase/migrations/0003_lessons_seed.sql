-- =====================================================================
-- Creator Growth OS — lesson seed data
-- Adds module grouping columns to public.lessons and seeds ~85 lessons
-- across the 4 starter programs. Replace this content via admin later.
-- Idempotent: re-running clears + re-inserts seed rows.
-- =====================================================================

alter table public.lessons
  add column if not exists module_number int,
  add column if not exists module_title text;

create index if not exists idx_lessons_program_module
  on public.lessons (program_id, module_number, sort_order);

-- Clear existing seeded lessons (idempotent re-run)
delete from public.lessons
where program_id in (
  select id from public.programs
  where slug in ('influencer-blueprint','content-that-connects','monetize-your-influence','scale-and-automate')
);

-- --------------------------------------------------------------------
-- THE INFLUENCER BLUEPRINT (basic) — 26 lessons across 4 modules + bonus
-- --------------------------------------------------------------------
insert into public.lessons
  (program_id, slug, title, duration_seconds, module_number, module_title, plan_access, content_type, sort_order)
select
  p.id, s.slug, s.title, s.duration_seconds, s.module_number, s.module_title, s.plan_access::subscription_plan, 'video', s.sort_order
from public.programs p
cross join (values
  ('defining-niche-sweet-spot','Defining Your Niche & Sweet Spot',492,1,'Foundation: Know Your Brand','basic',1),
  ('your-story-differentiator','Your Story, Your Differentiator',634,1,'Foundation: Know Your Brand','basic',2),
  ('brand-values-positioning','Brand Values & Positioning',555,1,'Foundation: Know Your Brand','basic',3),
  ('ideal-audience-deep-dive','Ideal Audience Deep Dive',470,1,'Foundation: Know Your Brand','basic',4),
  ('content-pillars-that-work','Content Pillars That Work',930,2,'Content That Connects','basic',5),
  ('hooks-that-stop-the-scroll','Hooks That Stop the Scroll',680,2,'Content That Connects','basic',6),
  ('story-formats-that-convert','Story Formats That Convert',725,2,'Content That Connects','basic',7),
  ('captions-that-convert','Engaging Captions That Convert',520,2,'Content That Connects','basic',8),
  ('thumbnails-and-covers','Thumbnails & Covers',415,2,'Content That Connects','basic',9),
  ('first-three-seconds','The First 3 Seconds',570,2,'Content That Connects','basic',10),
  ('weekly-content-system','Your Weekly Content System',850,3,'Consistency & Audience Growth','basic',11),
  ('batch-record-a-whole-week','Batch Record a Whole Week',740,3,'Consistency & Audience Growth','basic',12),
  ('platform-performance','How To Read Platform Performance',825,3,'Consistency & Audience Growth','basic',13),
  ('daily-engagement-loop','The Daily Engagement Loop',590,3,'Consistency & Audience Growth','basic',14),
  ('trends-without-losing-self','Riding Trends Without Losing Yourself',660,3,'Consistency & Audience Growth','basic',15),
  ('audience-feedback-loops','Audience Feedback Loops',495,3,'Consistency & Audience Growth','basic',16),
  ('monetization-readiness','Monetization Readiness Score',610,4,'Monetization & Brand Deals','basic',17),
  ('build-a-media-kit','Build a Media Kit That Wins',820,4,'Monetization & Brand Deals','basic',18),
  ('brand-outreach-templates','Brand Outreach Templates',690,4,'Monetization & Brand Deals','basic',19),
  ('rates-pricing-negotiation','Rates, Pricing & Negotiation',735,4,'Monetization & Brand Deals','basic',20),
  ('your-first-paid-brand-deal','Your First Paid Brand Deal',645,4,'Monetization & Brand Deals','basic',21),
  ('brand-deals-pipeline','Running a Brand Deals Pipeline',560,4,'Monetization & Brand Deals','basic',22),
  ('hire-first-editor','Hiring Your First Editor',730,5,'Scaling, Systems & Advanced Strategies','pro',23),
  ('automate-scheduling','Automating Scheduling & Replies',590,5,'Scaling, Systems & Advanced Strategies','pro',24),
  ('launching-products-services','Launching Products & Services',870,5,'Scaling, Systems & Advanced Strategies','pro',25),
  ('agency-track','The Agency Track for Creators',685,5,'Scaling, Systems & Advanced Strategies','pro',26)
) as s(slug, title, duration_seconds, module_number, module_title, plan_access, sort_order)
where p.slug = 'influencer-blueprint';

-- --------------------------------------------------------------------
-- CONTENT THAT CONNECTS (basic) — 20 lessons, 3 modules + bonus
-- --------------------------------------------------------------------
insert into public.lessons
  (program_id, slug, title, duration_seconds, module_number, module_title, plan_access, content_type, sort_order)
select
  p.id, s.slug, s.title, s.duration_seconds, s.module_number, s.module_title, s.plan_access::subscription_plan, 'video', s.sort_order
from public.programs p
cross join (values
  ('ctc-anatomy-of-a-viral-post','Anatomy of a Viral Post',525,1,'Content Fundamentals','basic',1),
  ('ctc-formats-that-spread','Formats That Spread',610,1,'Content Fundamentals','basic',2),
  ('ctc-write-the-perfect-hook','Write the Perfect Hook',480,1,'Content Fundamentals','basic',3),
  ('ctc-retention-blueprint','The Retention Blueprint',715,1,'Content Fundamentals','basic',4),
  ('ctc-tone-of-voice','Find Your Tone of Voice',550,1,'Content Fundamentals','basic',5),
  ('ctc-pillars-to-posts','Pillars to Posts: Idea Pipelines',640,2,'Build Your System','basic',6),
  ('ctc-weekly-schedule','Your Weekly Schedule That Works',595,2,'Build Your System','basic',7),
  ('ctc-batching','Batching Without Burnout',520,2,'Build Your System','basic',8),
  ('ctc-editing-shortcuts','Editing Shortcuts That Save Hours',680,2,'Build Your System','basic',9),
  ('ctc-on-camera-confidence','On-Camera Confidence',595,2,'Build Your System','basic',10),
  ('ctc-cross-platform','Cross-Platform Without Burning Out',750,2,'Build Your System','basic',11),
  ('ctc-platform-analytics','Reading Platform Analytics',810,3,'Grow on Purpose','basic',12),
  ('ctc-your-first-1000','Your First 1,000 True Fans',650,3,'Grow on Purpose','basic',13),
  ('ctc-collabs-that-grow','Collabs That Actually Grow You',620,3,'Grow on Purpose','basic',14),
  ('ctc-comment-strategy','Strategic Commenting & DMs',520,3,'Grow on Purpose','basic',15),
  ('ctc-content-audit','The 30-Minute Content Audit',445,3,'Grow on Purpose','basic',16),
  ('ctc-test-and-double-down','Test, Iterate, Double Down',590,3,'Grow on Purpose','basic',17),
  ('ctc-ai-content-assist','AI-Assisted Content Workflow',720,4,'Pro Workflows','pro',18),
  ('ctc-team-handoff','Handing Off to an Editor',605,4,'Pro Workflows','pro',19),
  ('ctc-content-ops','Content Ops at Scale',680,4,'Pro Workflows','pro',20)
) as s(slug, title, duration_seconds, module_number, module_title, plan_access, sort_order)
where p.slug = 'content-that-connects';

-- --------------------------------------------------------------------
-- MONETIZE YOUR INFLUENCE (basic) — 22 lessons, 3 modules + Pro bonus
-- --------------------------------------------------------------------
insert into public.lessons
  (program_id, slug, title, duration_seconds, module_number, module_title, plan_access, content_type, sort_order)
select
  p.id, s.slug, s.title, s.duration_seconds, s.module_number, s.module_title, s.plan_access::subscription_plan, 'video', s.sort_order
from public.programs p
cross join (values
  ('myi-monetization-mindset','The Monetization Mindset',515,1,'Set Your Foundation','basic',1),
  ('myi-readiness-score','Readiness Score: Are You Ready?',605,1,'Set Your Foundation','basic',2),
  ('myi-pricing-fundamentals','Pricing Fundamentals',680,1,'Set Your Foundation','basic',3),
  ('myi-rate-card-builder','Build Your Rate Card',590,1,'Set Your Foundation','basic',4),
  ('myi-niching-for-revenue','Niching for Revenue',540,1,'Set Your Foundation','basic',5),
  ('myi-media-kit-fast','Media Kit in 30 Minutes',625,2,'Brand Deals','basic',6),
  ('myi-finding-brands','Finding Brands That Pay',715,2,'Brand Deals','basic',7),
  ('myi-cold-outreach','Cold Outreach That Lands',810,2,'Brand Deals','basic',8),
  ('myi-pitching','Pitching Without Cringing',660,2,'Brand Deals','basic',9),
  ('myi-deliverables','Deliverables That Make Brands Repeat',590,2,'Brand Deals','basic',10),
  ('myi-contracts-basics','Contracts You Actually Sign',745,2,'Brand Deals','basic',11),
  ('myi-getting-paid','Getting Paid (and Paid On Time)',520,2,'Brand Deals','basic',12),
  ('myi-affiliate-101','Affiliate Marketing 101',580,3,'Diversify Your Income','basic',13),
  ('myi-digital-products','Your First Digital Product',870,3,'Diversify Your Income','basic',14),
  ('myi-services-offer','The Services Offer Stack',690,3,'Diversify Your Income','basic',15),
  ('myi-community-membership','Community & Membership',810,3,'Diversify Your Income','basic',16),
  ('myi-sponsorship-stack','Stacking Sponsorship Income',600,3,'Diversify Your Income','basic',17),
  ('myi-newsletter-monetize','Monetizing a Newsletter',525,3,'Diversify Your Income','basic',18),
  ('myi-tax-and-business','Tax & Business Basics for Creators',905,4,'Run the Business','pro',19),
  ('myi-revenue-systems','Revenue Systems & Automation',780,4,'Run the Business','pro',20),
  ('myi-financial-runway','Financial Runway & Reinvestment',715,4,'Run the Business','pro',21),
  ('myi-build-an-asset','Build an Asset, Not Just an Audience',640,4,'Run the Business','pro',22)
) as s(slug, title, duration_seconds, module_number, module_title, plan_access, sort_order)
where p.slug = 'monetize-your-influence';

-- --------------------------------------------------------------------
-- SCALE & AUTOMATE (pro) — 20 lessons, 4 modules, fully Pro-gated
-- --------------------------------------------------------------------
insert into public.lessons
  (program_id, slug, title, duration_seconds, module_number, module_title, plan_access, content_type, sort_order)
select
  p.id, s.slug, s.title, s.duration_seconds, s.module_number, s.module_title, s.plan_access::subscription_plan, 'video', s.sort_order
from public.programs p
cross join (values
  ('sa-creator-business','The Creator Business Mindset',640,1,'Scale Foundations','pro',1),
  ('sa-systems-thinking','Systems Thinking for Creators',715,1,'Scale Foundations','pro',2),
  ('sa-org-design','Org Design: You + 1 + 3',680,1,'Scale Foundations','pro',3),
  ('sa-decision-frameworks','Decision Frameworks at Scale',595,1,'Scale Foundations','pro',4),
  ('sa-sop-creator','SOPs for Creator Workflows',810,2,'Operations','pro',5),
  ('sa-hiring-editor','Hiring Your First Editor',780,2,'Operations','pro',6),
  ('sa-hiring-manager','Hiring a Manager (or Not)',640,2,'Operations','pro',7),
  ('sa-team-rituals','Weekly Team Rituals',520,2,'Operations','pro',8),
  ('sa-async-comms','Async Communication',490,2,'Operations','pro',9),
  ('sa-automate-scheduling','Automating Scheduling & Posting',620,3,'Automation','pro',10),
  ('sa-automate-engagement','Automating Engagement (Without Bots)',715,3,'Automation','pro',11),
  ('sa-content-repurposing','Content Repurposing Pipelines',680,3,'Automation','pro',12),
  ('sa-data-pipelines','Data Pipelines for Creators',850,3,'Automation','pro',13),
  ('sa-ai-co-pilot','AI as Your Co-Pilot',790,3,'Automation','pro',14),
  ('sa-product-flywheel','Build a Product Flywheel',870,4,'Leverage & Exit','pro',15),
  ('sa-community-leverage','Leverage Through Community',640,4,'Leverage & Exit','pro',16),
  ('sa-licensing-ip','Licensing Your IP',595,4,'Leverage & Exit','pro',17),
  ('sa-acquisition-paths','Acquisition & Exit Paths',780,4,'Leverage & Exit','pro',18),
  ('sa-second-act','The Creator Second Act',525,4,'Leverage & Exit','pro',19),
  ('sa-final-build','Final Build: Your 12-Month Plan',1020,4,'Leverage & Exit','pro',20)
) as s(slug, title, duration_seconds, module_number, module_title, plan_access, sort_order)
where p.slug = 'scale-and-automate';

-- --------------------------------------------------------------------
-- Update each program's total_lessons to match seeded count
-- --------------------------------------------------------------------
update public.programs p set total_lessons = sub.cnt
from (
  select program_id, count(*) as cnt
  from public.lessons
  group by program_id
) sub
where sub.program_id = p.id;
