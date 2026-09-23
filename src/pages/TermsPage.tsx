/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-baf-cyan/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-baf-cyan/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-baf-cyan/10 border border-baf-cyan/20 rounded-full px-5 py-2 mb-6">
            <Scale className="w-4 h-4 text-baf-cyan" />
            <span className="text-baf-cyan text-sm font-semibold tracking-wider uppercase">Legal</span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">
            Last updated: 3 June 2026
          </p>
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-white/30 font-medium uppercase tracking-widest">
            <Link to="/" className="hover:text-baf-cyan transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/50">Terms and Conditions</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 sm:p-12 backdrop-blur-xl space-y-10">

          {/* Intro */}
          <p className="text-gray-400 text-base leading-relaxed">
            Welcome to the official website of <span className="text-white font-semibold">BAF Shaheen College Dhaka Business Club (BAFSDBC)</span>. By visiting or using this website, you agree to follow these Terms and Conditions. If you do not agree, please do not use the website.
          </p>

          <Section number="1" title="About BAFSDBC">
            <p>BAFSDBC is a student club connected with BAF Shaheen College Dhaka. The website is used to share club updates, event information, blog posts, announcements, photos, forms, and other club-related content.</p>
          </Section>

          <Section number="2" title="Use of the Website">
            <p className="mb-4">You agree to use this website only for lawful, respectful, and appropriate purposes. You must not:</p>
            <ul className="space-y-3">
              {[
                'Misuse the website or try to damage, hack, overload, or disrupt it.',
                'Submit false, misleading, offensive, harmful, or abusive information.',
                'Copy, modify, or republish club content without permission.',
                'Use the website to harass, threaten, impersonate, or harm others.',
                'Upload or submit content that violates any law, school rule, or third-party right.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section number="3" title="Student and Visitor Responsibility">
            <p>Visitors, students, members, and participants are responsible for the accuracy of any information they submit through forms, messages, event registrations, or other communication channels.</p>
            <p className="mt-4">If you are a student under 18, you should use this website and submit information with appropriate permission from your parent, guardian, or school authority where required.</p>
          </Section>

          <Section number="4" title="Event Registration and Participation">
            <p>BAFSDBC may publish event notices, competition details, registration forms, schedules, rules, results, and participation instructions.</p>
            <p className="mt-4">Event dates, rules, venues, eligibility, fees, and other details may change if necessary. BAFSDBC may update or cancel events due to administrative, technical, safety, academic, or unavoidable reasons.</p>
            <p className="mt-4">Participation in any BAFSDBC event may require following separate event rules, school rules, venue rules, and instructions from organizers.</p>
          </Section>

          <Section number="5" title="Website Content">
            <p>The content on this website is provided for general informational and club-related purposes. While BAFSDBC tries to keep information accurate and updated, we do not guarantee that all information will always be complete, error-free, or available at all times.</p>
            <p className="mt-4">BAFSDBC may edit, update, remove, or replace website content without prior notice.</p>
          </Section>

          <Section number="6" title="Blogs, Articles, and Student Contributions">
            <p>The website may publish articles, blogs, opinions, or creative submissions from students, members, alumni, or contributors.</p>
            <p className="mt-4">The views expressed in contributor content belong to the individual author and do not always represent the official position of BAFSDBC, BAF Shaheen College Dhaka, or any related authority.</p>
            <p className="mt-4 mb-4">By submitting content to BAFSDBC, you confirm that:</p>
            <ul className="space-y-3">
              {[
                'The content is your own original work or you have permission to submit it.',
                'The content does not copy someone else\'s work without proper credit.',
                'The content does not contain harmful, offensive, illegal, or misleading material.',
                'BAFSDBC may review, edit, publish, remove, or reject the content.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section number="7" title="Photos, Videos, and Media">
            <p>BAFSDBC may publish photos, videos, posters, graphics, or event highlights on the website or official social media pages for documentation, promotion, and archive purposes.</p>
            <p className="mt-4">If you believe a photo, video, or other media includes you and you want it removed or corrected, please contact us at <a href="mailto:businessclub.bafsd@gmail.com" className="text-baf-cyan hover:underline">businessclub.bafsd@gmail.com</a> with details of the content.</p>
          </Section>

          <Section number="8" title="Intellectual Property">
            <p>Unless otherwise stated, the website design, text, graphics, logos, posters, event materials, photos, videos, and other content belong to BAFSDBC or are used with permission.</p>
            <p className="mt-4">You may view and share official posts for personal, educational, or club-related purposes, but you may not use BAFSDBC content for commercial purposes or claim it as your own without written permission.</p>
          </Section>

          <Section number="9" title="Third-Party Links">
            <p>This website may include links to third-party platforms such as Facebook, Instagram, Google Forms, YouTube, or other websites.</p>
            <p className="mt-4">BAFSDBC is not responsible for the content, privacy practices, terms, security, or availability of third-party websites. When you use third-party platforms, their own terms and privacy policies apply.</p>
          </Section>

          <Section number="10" title="No Commercial Guarantee">
            <p>Information shared on this website about business, entrepreneurship, competitions, leadership, or education is for learning and club activities. It should not be treated as professional financial, legal, or business advice.</p>
          </Section>

          <Section number="11" title="Limitation of Liability">
            <p>BAFSDBC will try to maintain the website properly, but we are not responsible for losses, errors, technical issues, data loss, interruptions, or damages caused by using or being unable to use the website.</p>
          </Section>

          <Section number="12" title="Changes to These Terms">
            <p>BAFSDBC may update these Terms and Conditions from time to time. The updated version will be posted on this page with a new "Last updated" date.</p>
          </Section>

          <Section number="13" title="Contact Us">
            <p className="mb-4">For questions, corrections, permission requests, or complaints about these Terms, please contact:</p>
            <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-6 space-y-2">
              <p className="text-white font-semibold">BAF Shaheen College Dhaka Business Club (BAFSDBC)</p>
              <p className="text-gray-400">Email: <a href="mailto:businessclub.bafsd@gmail.com" className="text-baf-cyan hover:underline">businessclub.bafsd@gmail.com</a></p>
              <p className="text-gray-400">Website: <a href="https://bafsdbc.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-baf-cyan hover:underline">https://bafsdbc.vercel.app/</a></p>
            </div>
          </Section>

          {/* Also read */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-white/30 text-sm">Also read our</span>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-baf-cyan text-sm font-semibold hover:underline transition-colors"
            >
              Privacy Policy <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-baf-cyan/10 border border-baf-cyan/20 flex items-center justify-center text-baf-cyan text-xs font-bold">
          {number}
        </span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="pl-11 text-gray-400 text-base leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
