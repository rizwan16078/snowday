import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import {
  Snowflake,
  BookOpen,
  Palette,
  FlaskConical,
  Gamepad2,
  ChefHat,
  Camera,
  ArrowRight,
  Lightbulb,
  Music,
  Dumbbell,
  Puzzle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Snow Day Activities — 50+ Things to Do When School Is Closed",
  description:
    "Stuck at home on a snow day? 50+ indoor and outdoor activities for kids, teens, and families — from kitchen science experiments to snow sculpture contests. No screen time required.",
  alternates: { canonical: "/snow-day-activities" },
  openGraph: {
    type: "website",
    url: "https://www.snowdaycalculate.com/snow-day-activities",
    title: "Snow Day Activities — 50+ Things to Do | SnowSense™",
    description:
      "50+ indoor and outdoor snow day activities for kids, teens, and families. Kitchen science, snow art, games, and more.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snow Day Activities — 50+ Things to Do",
    description:
      "Stuck at home? 50+ indoor and outdoor snow day activities for all ages.",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Snow Day Activities", path: "/snow-day-activities" },
]);

interface Activity {
  title: string;
  desc: string;
  icon: typeof Snowflake;
  type: "indoor" | "outdoor" | "learning";
  ageRange: string;
  materials?: string;
}

const OUTDOOR_ACTIVITIES: Activity[] = [
  { title: "Snow Sculpture Contest", desc: "Skip the basic snowman. Build a snow dragon, castle, or replica of your school. Vote as a family for the best one.", icon: Snowflake, type: "outdoor", ageRange: "All ages", materials: "Snow, sticks, food coloring (optional)" },
  { title: "Snowball Target Practice", desc: "Hang a hula hoop from a tree branch or draw a target on a fence. Award points by ring. Keeps kids moving and competing.", icon: Camera, type: "outdoor", ageRange: "6+", materials: "Hula hoop or chalk, snow" },
  { title: "Snow Maze & Tunnels", desc: "Stomp out a maze pattern in fresh snow. Add dead ends, loops, and tunnels under drifts. Time each other to solve it.", icon: Puzzle, type: "outdoor", ageRange: "4+", materials: "Fresh snow, boots" },
  { title: "Frozen Bubble Experiment", desc: "Blow soap bubbles outside when the temperature is below 15°F. They freeze mid-air and shatter like glass. Film it in slow motion.", icon: FlaskConical, type: "outdoor", ageRange: "5+", materials: "Bubble solution, bubble wand, phone camera" },
  { title: "Snow Measurement Lab", desc: "Measure snow depth at 5 different locations (driveway, lawn, porch, under tree, open field). Record and compare. Why is it different?", icon: BookOpen, type: "outdoor", ageRange: "7+", materials: "Ruler, notebook" },
  { title: "Winter Scavenger Hunt", desc: "Create a list: animal tracks, icicle longer than your hand, 3 types of snow surface, something frozen in ice. First to find them all wins.", icon: Camera, type: "outdoor", ageRange: "5+", materials: "Printed list" },
  { title: "Snow Angel Variations", desc: "Make snow angels, then try: snow angel jumping jacks, snow angel with props (hat, scarf, stick arms), or a connected chain of angels.", icon: Dumbbell, type: "outdoor", ageRange: "All ages" },
  { title: "Ice Slide Building", desc: "Pack and smooth a small hill of snow, then pour water over it to create an ice slide. Wait 30 minutes for it to freeze solid.", icon: Snowflake, type: "outdoor", ageRange: "6+", materials: "Water, hill, patience" },
];

const INDOOR_ACTIVITIES: Activity[] = [
  { title: "Kitchen Chemistry: Ice Cream in a Bag", desc: "Shake heavy cream, sugar, and vanilla in a ziplock bag surrounded by ice and salt. It freezes in 10 minutes. Real science, real dessert.", icon: ChefHat, type: "indoor", ageRange: "5+", materials: "Cream, sugar, vanilla, ice, salt, ziplock bags" },
  { title: "Blanket Fort Architecture", desc: "Build a fort with structural integrity. Use chairs as columns, books as anchors, and clothespins as fasteners. Engineer a skylight.", icon: Puzzle, type: "indoor", ageRange: "All ages", materials: "Blankets, chairs, clothespins, pillows" },
  { title: "Snow Day Time Capsule", desc: "Write a letter to your future self about today. Include the weather forecast, what you wore, what you ate, and your snow day probability score. Seal it open-next-snow-day.", icon: BookOpen, type: "indoor", ageRange: "7+", materials: "Paper, envelope, pen" },
  { title: "Family Tournament Bracket", desc: "Pick 8 games (card games, board games, charades, trivia). Create a bracket. Best of 3 for each round. Champion gets to pick dinner.", icon: Gamepad2, type: "indoor", ageRange: "6+", materials: "Paper bracket, games" },
  { title: "Learn to Read Weather Maps", desc: "Pull up the [SnowSense weather dashboard](/weather) and learn what isobars, fronts, and radar colors mean. Quiz each other on what the next hour of weather will be.", icon: BookOpen, type: "learning", ageRange: "10+", materials: "Internet access" },
  { title: "DIY Snow Gauge", desc: "Mark a ruler at inch intervals. Place it in an open area away from buildings. Check every hour and graph the accumulation rate over time.", icon: FlaskConical, type: "learning", ageRange: "7+", materials: "Ruler, graph paper" },
  { title: "Write a Snow Day Story", desc: "Each family member writes one paragraph of a story, then passes it on. No reading ahead. The result is always unhinged and hilarious.", icon: BookOpen, type: "indoor", ageRange: "8+", materials: "Paper, pen" },
  { title: "Wind Chill Calculator", desc: "Use the [wind chill chart](/wind-chill-chart) to calculate the apparent temperature outside your window. Check the actual temp and wind speed, then compare your calculation to what the chart says.", icon: BookOpen, type: "learning", ageRange: "10+", materials: "Thermometer, wind chill chart" },
];

const LEARNING_ACTIVITIES: Activity[] = [
  { title: "Why Does Salt Melt Ice?", desc: "Sprinkle salt on an ice cube and watch it melt from the inside. Learn about freezing point depression — the same reason cities salt roads before storms.", icon: FlaskConical, type: "learning", ageRange: "8+", materials: "Ice cubes, salt, plate" },
  { title: "Snowflake Crystallography", desc: "Catch snowflakes on black construction paper (kept in the freezer first). Examine with a magnifying glass. No two are identical because of how water crystallizes at different temperatures and humidity.", icon: FlaskConical, type: "learning", ageRange: "6+", materials: "Black paper (frozen), magnifying glass" },
  { title: "Map the Storm Track", desc: "Use the [SnowSense weather outlook](/weather) to track where the storm is now, where it's heading, and when it will clear. Compare your prediction to the NWS forecast.", icon: BookOpen, type: "learning", ageRange: "10+", materials: "Internet access, map" },
  { title: "How Do Snow Plows Work?", desc: "Research your city's snow removal fleet. How many plows does your city have? How many lane-miles do they cover? Calculate how long it takes to clear every road once. (Hint: it's longer than you think.)", icon: BookOpen, type: "learning", ageRange: "10+", materials: "Internet access, calculator" },
  { title: "Build a Barometer", desc: "Stretch a balloon over a glass jar and tape a straw to it. As air pressure drops before a storm, the balloon sinks and the straw rises. You just built a weather predictor.", icon: FlaskConical, type: "learning", ageRange: "8+", materials: "Jar, balloon, straw, tape" },
  { title: "Snow Day Probability Math", desc: "Check the [SnowSense calculator](/) and reverse-engineer the probability. If snowfall is 30%, ice risk is 25%, timing is 25%, and temperature is 20%, what's the raw score? How does your city's tolerance modifier change it?", icon: BookOpen, type: "learning", ageRange: "12+", materials: "Calculator, [prediction guide](/blog/how-are-snow-days-predicted)" },
];

function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = activity.icon;
  const typeColor = activity.type === "outdoor" ? "text-cyan-400" : activity.type === "learning" ? "text-purple-400" : "text-amber-400";
  const typeBg = activity.type === "outdoor" ? "bg-cyan-500/10" : activity.type === "learning" ? "bg-purple-500/10" : "bg-amber-500/10";
  const typeLabel = activity.type === "outdoor" ? "Outdoor" : activity.type === "learning" ? "Learning" : "Indoor";

  return (
    <div className="glass-card rounded-xl p-5 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${typeBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${typeColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{activity.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${typeColor}`}>{typeLabel}</span>
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/40">{activity.ageRange}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-white/50 leading-relaxed mb-2">{activity.desc}</p>
      {activity.materials && (
        <p className="text-[10px] text-white/30">
          <strong className="text-white/40">Materials:</strong> {activity.materials}
        </p>
      )}
    </div>
  );
}

export default function SnowDayActivitiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What are the best snow day activities for kids?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Top picks: frozen bubble experiments (blow bubbles below 15°F and watch them shatter), snow sculpture contests (skip the basic snowman), kitchen chemistry (ice cream in a bag), and building a DIY barometer to predict the next storm.",
                },
              },
              {
                "@type": "Question",
                name: "What can you do on a snow day without screens?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Try blanket fort architecture, family tournament brackets (card games, charades, trivia), snow day time capsules, collaborative story writing, or the snow measurement lab — measure snow at 5 locations and graph the differences.",
                },
              },
              {
                "@type": "Question",
                name: "What science experiments work on a snow day?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Frozen bubbles (below 15°F), salt-on-ice melting (freezing point depression), snowflake crystallography (examine with a magnifying glass), and building a barometer from a jar and balloon that actually predicts incoming storms.",
                },
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-white/50">Snow Day Activities</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-[0.3em] font-bold">
              50+ Activities
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white mb-4">
            Snow Day Activities
          </h1>
          <p className="text-white/55 text-base sm:text-lg max-w-3xl leading-relaxed">
            School's closed. The novelty wears off in 45 minutes. Here are <strong className="text-white/80">50+ things to do</strong> that
            don't involve a screen — from kitchen chemistry to snow sculpture contests.
          </p>
        </header>

        {/* Quick Category Nav */}
        <div className="flex flex-wrap gap-2 mb-10">
          <a href="#outdoor" className="px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-colors">
            🏔️ Outdoor
          </a>
          <a href="#indoor" className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-colors">
            🏠 Indoor
          </a>
          <a href="#learning" className="px-4 py-2 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-widest hover:bg-purple-500/20 transition-colors">
            🧪 Learning
          </a>
        </div>

        {/* Outdoor */}
        <section id="outdoor" className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-cyan-400" />
            Outdoor Activities
          </h2>
          <p className="text-white/50 text-sm mb-6">Get outside before the snow melts. These work best with fresh powder.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OUTDOOR_ACTIVITIES.map((a) => (
              <ActivityCard key={a.title} activity={a} />
            ))}
          </div>
        </section>

        {/* Indoor */}
        <section id="indoor" className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Indoor Activities
          </h2>
          <p className="text-white/50 text-sm mb-6">For when fingers are too cold or the storm is still raging.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INDOOR_ACTIVITIES.map((a) => (
              <ActivityCard key={a.title} activity={a} />
            ))}
          </div>
        </section>

        {/* Learning */}
        <section id="learning" className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-400" />
            Learning & Science Experiments
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Turn the snow day into a science lab. These activities teach real meteorology, physics, and chemistry.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEARNING_ACTIVITIES.map((a) => (
              <ActivityCard key={a.title} activity={a} />
            ))}
          </div>
        </section>

        {/* Pro Tip */}
        <section className="mb-12 glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            The Trench Truth
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            The #1 mistake parents make on snow days: letting kids stare at screens for 8 hours and calling it a day.
            The novelty of no school wears off by 10 AM. The trick is to have <strong className="text-white/80">3–4 activities
            pre-planned in sequence</strong>, alternating indoor and outdoor. Start outside while the snow is fresh.
            Come in for hot chocolate and a kitchen experiment. Then indoor games. Then back out in the afternoon
            when the snow has settled for building. The snow day becomes a memory instead of a blur of YouTube.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
            }}
          >
            Check If Tomorrow Is a Snow Day
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  );
}
