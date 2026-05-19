import { Metadata } from "next";
import { AnimatedPageWrapper } from "@/components/layout/AnimatedPageWrapper";
import { breadcrumbListSchema, webPageSchema } from "@/lib/breadcrumb-schema";
import { Mail, MessageSquare, Globe, Code } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the SnowSense™ team.",
  alternates: {
    canonical: "/contact",
  },
};

function ContactMethod({ icon: Icon, title, description, href, label }: { icon: any, title: string, description: string, href: string, label: string }) {
  return (
    <a 
      href={href}
      className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 block"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">{title}</h3>
      </div>
      <p className="text-sm text-white/50 leading-relaxed mb-4">{description}</p>
      <span className="text-xs font-bold uppercase tracking-widest text-blue-500 group-hover:text-blue-400 transition-colors">
        {label} →
      </span>
    </a>
  );
}

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

const pageSchema = webPageSchema({
  path: "/contact",
  name: "Contact SnowSense™",
  description: "Get in touch with the SnowSense™ team for support, partnerships, or feedback.",
});

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <AnimatedPageWrapper 
      title="Get in Touch" 
      subtitle="Connecting you with the team behind the intelligence."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactMethod 
          icon={Mail} 
          title="Direct Support" 
          description="Report inaccuracies in your school district or technical issues with the calculator."
          href="mailto:support@snowsense.app"
          label="Email Us"
        />
        <ContactMethod 
          icon={MessageSquare} 
          title="Feature Requests" 
          description="Have an idea for a new metric or data source? We're constantly evolving."
          href="mailto:feedback@snowsense.app"
          label="Share Ideas"
        />
        <ContactMethod 
          icon={Globe} 
          title="Social Pulse" 
          description="Stay updated with live storm tracking and new engine deployments."
          href="https://twitter.com/snowdaycalculate"
          label="Follow @SnowSense"
        />
        <ContactMethod 
          icon={Code} 
          title="Open Intelligence" 
          description="Inquiries regarding our open-data integration and API capabilities."
          href="/about"
          label="View Methodology"
        />
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors duration-700" />
        
        <h2 className="text-2xl font-bold text-white mb-4">Emergency Inquiries?</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
          For urgent press or partnership inquiries, please include "URGENT" in your email subject line for prioritized routing.
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
          Response time: <span className="text-blue-400">~24 Hours</span>
        </div>
      </div>
    </AnimatedPageWrapper>
    </>
  );
}
