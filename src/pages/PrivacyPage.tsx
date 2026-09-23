/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-baf-cyan/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-baf-cyan/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-baf-cyan/10 border border-baf-cyan/20 rounded-full px-5 py-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-baf-cyan" />
            <span className="text-baf-cyan text-sm font-semibold tracking-wider uppercase">Legal</span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">
            Last updated: 3 June 2026
          </p>
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-white/30 font-medium uppercase tracking-widest">
            <Link to="/" className="hover:text-baf-cyan transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/50">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 sm:p-12 backdrop-blur-xl space-y-10">

          {/* Intro */}
          <p className="text-gray-400 text-base leading-relaxed">
            This Privacy Policy explains how <span className="text-white font-semibold">BAF Shaheen College Dhaka Business Club (BAFSDBC)</span> may collect, use, store, and protect information when you visit our website, register for events, submit forms, contact us, or interact with our official online platforms.
            By using this website, you agree to the practices described in this Privacy Policy.
          </p>

          <Section number="1" title="Information We May Collect">
            <p className="mb-4 font-semibold text-white/70">a. Information you provide directly</p>
            <p className="mb-4">You may provide information when you register for an event or competition, apply for membership or volunteer work, submit a blog or article, fill out a contact or feedback form, message us through email or social media, or participate in surveys or club activities.</p>
            <p className="mb-3">This may include:</p>
            <ul className="space-y-2 mb-6">
              {[
                'Name', 'Class, section, batch, or institution', 'Email address', 'Phone number',
                'Student ID or participant ID, if required', 'Event preferences or registration details',
                'Submitted writing, answers, files, photos, or other materials',
                'Any message or information you choose to send.',
                'Certificate details: Name, Email, Phone number, Batch, Club/Event role, Disclaimer agreement, Signature notice agreement.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mb-4 font-semibold text-white/70">b. Automatically collected information</p>
            <p className="mb-4">When you visit the website, basic technical information may be collected automatically, such as device type, browser type, IP address, pages visited, date and time of visit, referring website, and general usage data. This information is usually collected to keep the website secure, understand visitor activity, and improve website performance.</p>
            <p className="font-semibold text-white/70 mb-2">c. Photos and event media</p>
            <p>During BAFSDBC events, activities, and programs, photos or videos may be taken for documentation, promotion, archive, and publication purposes.</p>
          </Section>

          <Section number="2" title="How We Use Information">
            <p className="mb-4">BAFSDBC may use collected information to:</p>
            <ul className="space-y-3">
              {[
                'Manage event registration and participation.',
                'Contact participants about events, notices, updates, or results.',
                'Verify student, member, volunteer, or participant information.',
                'Publish selected blogs, articles, submissions, photos, or achievements.',
                'Respond to questions, feedback, or requests.',
                'Improve the website, forms, events, and club activities.',
                'Maintain safety, discipline, and proper administration.',
                'Prevent misuse, spam, fraud, or unauthorized access.',
                'Keep records of club activities.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section number="3" title="Legal and School-Related Basis">
            <p>Because BAFSDBC is a student club, some information may be used for school-related administration, event management, communication, safety, and record-keeping.</p>
            <p className="mt-4">If you are under 18, you should submit personal information only with appropriate permission from your parent, guardian, or school authority where required.</p>
          </Section>

          <Section number="4" title="Sharing of Information">
            <p className="mb-4">BAFSDBC does not sell personal information. We may share information only when necessary with:</p>
            <ul className="space-y-3">
              {[
                'Club executives, moderators, volunteers, or authorized organizers.',
                'BAF Shaheen College Dhaka authorities, where required.',
                'Event judges, partners, or coordinators, where relevant.',
                'Service providers used for forms, hosting, email, analytics, or communication.',
                'Legal or safety authorities, if required by law or necessary for protection.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">Only necessary information should be shared for the relevant purpose.</p>
          </Section>

          <Section number="5" title="Third-Party Services">
            <p className="mb-4">BAFSDBC may use third-party services such as Vercel or other website hosting providers, Google Forms, Google Sheets, Google Drive, or Google Workspace tools, Facebook, Instagram, YouTube, or other social media platforms, and analytics, email, or communication tools.</p>
            <p className="mb-4">Specifically, the certificate information form utilizes Google Forms, Google Sheets, and the AutoCrat extension to store responses, generate certificate PDFs, and automate email delivery of the certificates.</p>
            <p>These third-party services may collect information under their own privacy policies. BAFSDBC is not responsible for the privacy practices of third-party platforms.</p>
          </Section>

          <Section number="6" title="Cookies and Tracking">
            <p>The website may use cookies or similar technologies to improve user experience, remember preferences, measure traffic, and maintain security.</p>
            <p className="mt-4">You can usually disable cookies through your browser settings. Some website features may not work properly if cookies are disabled.</p>
          </Section>

          <Section number="7" title="Data Storage and Security">
            <p>BAFSDBC will try to protect collected information using reasonable technical and organizational measures.</p>
            <p className="mt-4">However, no website, online form, email system, or internet-based service can be guaranteed to be completely secure. Users should avoid submitting unnecessary sensitive information.</p>
          </Section>

          <Section number="8" title="Data Retention">
            <p>BAFSDBC may keep personal information only as long as needed for event management, club records, communication, legal requirements, safety, or administrative purposes.</p>
            <p className="mt-4">When information is no longer needed, BAFSDBC may delete, archive, or anonymize it where practical.</p>
          </Section>

          <Section number="9" title="Student Privacy">
            <p>BAFSDBC respects the privacy of students and young participants. We aim to collect only necessary information for club activities, events, communication, and administration.</p>
            <p className="mt-4">Students should not submit private or sensitive information unless it is clearly required for a club-related purpose.</p>
          </Section>

          <Section number="10" title="Public Content">
            <p className="mb-4">Some content may be published publicly, including:</p>
            <ul className="space-y-3">
              {[
                'Event photos and videos.',
                'Names of winners, participants, organizers, or contributors.',
                'Blogs, articles, or submissions.',
                'Achievements, announcements, and event highlights.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">If you want content related to you reviewed, corrected, or removed, contact us at <a href="mailto:businessclub.bafsd@gmail.com" className="text-baf-cyan hover:underline">businessclub.bafsd@gmail.com</a>.</p>
          </Section>

          <Section number="11" title="Your Rights and Choices">
            <p className="mb-4">You may contact BAFSDBC to request:</p>
            <ul className="space-y-3">
              {[
                'Access to information you submitted.',
                'Correction of inaccurate information.',
                'Removal of certain content or information.',
                'Withdrawal from event communication, where possible.',
                'Clarification about how your information is used.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-baf-cyan flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">Some requests may be limited by event records, school requirements, safety needs, or administrative obligations.</p>
          </Section>

          <Section number="12" title="Links to Other Websites">
            <p>Our website may link to external websites or social media pages. We are not responsible for the content, security, or privacy practices of those websites.</p>
            <p className="mt-4">You should review the privacy policies of third-party websites before submitting information there.</p>
          </Section>

          <Section number="13" title="Changes to This Privacy Policy">
            <p>BAFSDBC may update this Privacy Policy from time to time. The updated version will be posted on this page with a new "Last updated" date.</p>
          </Section>

          <Section number="14" title="Contact Us">
            <p className="mb-4">For privacy questions, correction requests, removal requests, or complaints, contact:</p>
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
              to="/terms"
              className="inline-flex items-center gap-2 text-baf-cyan text-sm font-semibold hover:underline transition-colors"
            >
              Terms and Conditions <ChevronRight className="w-4 h-4" />
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
