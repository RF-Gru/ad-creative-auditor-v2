import { DatasetPreset } from '../types';

export const SAMPLE_DATASETS: DatasetPreset[] = [
  {
    id: 'dtc-skincare',
    name: 'DTC Skincare & Glow Campaign',
    description: 'Ecommerce Meta/Instagram ads testing problem-solution, UGC, founder story, and before-and-after hooks.',
    industry: 'Beauty & Ecommerce',
    adCount: 10,
    csvContent: `Ad Name,Creative Copy,Headline,CTA,Spend,Impressions,Clicks,Conversions,Revenue
"Glow_UGC_01","Stop hiding your breakouts! I tried this 3-step peptide serum for 7 days and my skin has literally never looked clearer. Zero filters, just real hydration. Claim 20% off today!","Clear Skin in 7 Days","Shop Now",1420.50,48200,1638,48,4320.00
"Glow_FounderStory_02","I created this serum after struggling with cystic acne for 10 years. Traditional creams burned my skin barrier, so I formulated a 100% botanical lipid blend that restores balance overnight.","Why I Made This Serum","Order Today",1850.00,56000,1792,56,5880.00
"Glow_PainPoint_03","Tired of foundation caking over dry patches? Most moisturizers only sit on the surface. Our nano-hyaluronic technology sinks 5 layers deep to lock in 24hr dewiness.","Ditch Caky Foundation","Shop Now",980.00,31000,899,22,2150.00
"Glow_UsVsThem_04","Us vs Them: Our Serum has 5 active peptides + 0 harsh chemicals. Generic Serums have 90% water filler + artificial fragrance. See the difference for yourself!","Better Than Generic Serums","Get Started",1200.00,42000,1134,36,3600.00
"Glow_Discount_05","FLASH SALE: Get 30% off our bestseller bundle! Limited stock available for the next 48 hours only. Tap link to secure your order now.","30% Off Flash Sale","Claim Discount",1650.00,68000,1224,14,1280.00
"Glow_FearOfMissingOut_06","Over 50,000 women have switched to this organic serum. Back in stock after selling out 3 times this year! Don't miss out again.","Back In Stock Again!","Shop Now",1100.00,39000,1053,38,3990.00
"Glow_VagueFeature_07","Experience the power of advanced bio-dermal botanical synthesis. Engineered with high efficiency molecules for optimal cosmetic enhancement.","Advanced Skin Tech","Learn More",1500.00,51000,612,6,420.00
"Glow_Influencer_08","Watch beauty creator @SarahGlow review our viral serum live on camera! 'Honestly the smoothest texture ever, 10/10 recommendation.'","As Seen On TikTok","Shop Now",1350.00,44000,1408,41,4100.00
"Glow_StaleAd_09","Hydrate your skin every day with our classic hydrating moisturizer. Made with aloe and jojoba oil for soft feeling skin.","Classic Hydration","Shop Now",2200.00,92000,1104,11,990.00
"Glow_Guarantee_10","Try it risk-free for 60 days. If you don't notice visibly radiant, plumper skin, we'll give you 100% of your money back. No return shipping fees!","60-Day Money Back Guarantee","Try Risk-Free",890.00,29000,986,31,3100.00`,
  },
  {
    id: 'b2b-saas',
    name: 'B2B SaaS Growth Engine',
    description: 'LinkedIn & Google Ads campaign promoting an AI workflow automation tool aimed at Founders and CMOs.',
    industry: 'B2B SaaS & Tech',
    adCount: 8,
    csvContent: `Ad Name,Creative Copy,Headline,CTA,Spend,Impressions,Clicks,Conversions,Revenue
"SaaS_ROICalculator_01","How much manual data entry is your sales team wasting? Our AI agent saves 14 hours per rep every week. Calculate your team's ROI in 30 seconds.","Save 14 Hours Per Rep","Calculate ROI",2400.00,38000,1140,42,10500.00
"SaaS_CompetitorDefector_02","Switching from Salesforce? Migrate all customer records, pipeline deals, and custom workflows in under 10 minutes with zero downtime guaranteed.","Migrate in 10 Minutes","Start Free Trial",1950.00,31000,899,31,7750.00
"SaaS_FrustrationCallout_03","Still updating CRM fields manually in 2026? Stop paying senior account executives to act as data entry clerks. Automate pipeline updates automatically.","Stop Manual CRM Entry","Try Demo",1600.00,28000,868,28,7000.00
"SaaS_GenericEnterprise_04","Empower your modern revenue organization with scalable multi-tenant cloud orchestration and synergized enterprise intelligence suites.","Enterprise Solutions","Book Demo",2800.00,49000,539,4,1000.00
"SaaS_CaseStudy_05","How TechCorp scaled pipeline from $2M to $8M in 90 days using automated lead enrichment and instant AI follow-ups. Read the full case study.","$2M to $8M Pipeline Case Study","Read Case Study",1800.00,34000,1088,34,8500.00
"SaaS_FreeTrial_06","Get 14 days of unlimited AI workflows. No credit card required, instant setup, cancel anytime with one click.","Start Free Trial Today","Sign Up Free",1450.00,41000,902,23,4600.00
"SaaS_StaleB2B_07","Streamline your corporate communications and manage your tasks effectively with our intuitive workspace platform.","Intuitive Workspace","Learn More",2100.00,68000,680,7,1400.00
"SaaS_FounderQuote_08","'We replaced 4 separate software subscriptions with this single AI workspace.' - Alex Vance, Founder at ScaleUp","1 Tool Replaces 4 Subscriptions","Get Started",1250.00,26000,832,27,6750.00`,
  },
  {
    id: 'fitness-app',
    name: 'Fitness & Health Mobile App',
    description: 'Meta, TikTok & Apple Search Ads campaign targeting home workout & habit building app installs.',
    industry: 'Mobile App / Health',
    adCount: 8,
    csvContent: `Ad Name,Creative Copy,Headline,CTA,Spend,Impressions,Clicks,Conversions,Revenue
"Fit_15MinWorkout_01","No gym membership? No problem. Burn 300 calories in 15 minutes right from your living room with zero equipment needed. Download the app today!","15-Min At-Home Workouts","Download App",1150.00,52000,2184,72,2880.00
"Fit_HabitTracker_02","Why 92% of fitness resolutions fail by week 3: They lack daily accountability. Our AI trainer sends custom 2-minute micro-habits every morning.","Build Habits That Stick","Install Free",980.00,41000,1722,58,2320.00
"Fit_SocialProof_03","Over 2,000,000 users are crushing their body transformation goals. See why Apple named us App of the Day!","App of the Day Winner","Get App",1300.00,59000,2242,65,2600.00
"Fit_GenericPromo_04","Achieve your ultimate wellness potential with personalized exercise routines and nutrition tracking modules.","Achieve Wellness Today","Install",1600.00,62000,868,12,480.00
"Fit_7DayChallenge_05","Join the 7-Day Shred Challenge! Get full access to customized meal plans and daily workout videos 100% free for 7 days.","7-Day Free Shred Challenge","Claim Free Pass",1220.00,48000,1920,54,2160.00
"Fit_FatiguedBanner_06","Get fit fast with daily exercise routines designed for busy professionals and parents.","Daily Fitness Routines","Download",2100.00,95000,1330,16,640.00
"Fit_BeforeAfter_07","'I lost 18 lbs in 6 weeks without starving or spending hours in the gym.' Real results from real app members.","18 lbs Lost in 6 Weeks","Start Transformation",1050.00,43000,1806,61,2440.00
"Fit_Discount_08","New Year Sale: Get 50% off Annual Premium Pass! Less than $0.15 a day for a dedicated AI personal trainer.","50% Off Annual Pass","Get 50% Off",1400.00,51000,1632,38,1520.00`,
  },
];
