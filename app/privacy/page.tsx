import Link from "next/link";

function ComlyLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
        fill="#1a1a2e"
      />
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="url(#swooshGradP)"
      />
      <defs>
        <linearGradient id="swooshGradP" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-[#f0f0f0] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ComlyLogo />
            <span className="font-bold text-[#0a0a0a] text-base">Comly</span>
          </Link>
          <Link href="/" className="text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#5B2D91] mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-[#0a0a0a] mb-4">Privacy Policy</h1>
          <p className="text-[#6b6b6b]">Last updated: May 9, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-[15px] leading-relaxed text-[#3a3a3a]">

          <section>
            <p>
              Comly AI (&ldquo;Comly&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our
              website at <strong>trycomly.com</strong> and our AI visibility audit platform (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p className="mt-4">
              By using the Service you agree to the practices described in this policy. If you do not agree, please
              discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">1. Information We Collect</h2>
            <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">Information you provide</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#3a3a3a]">
              <li><strong>Account data</strong> — email address and password when you sign up.</li>
              <li><strong>Brand profile</strong> — company name, website URL, category, competitors, and use-case descriptions you enter to configure an audit.</li>
              <li><strong>Payment information</strong> — billing details processed securely through our payment provider (Stripe). We do not store full card numbers.</li>
            </ul>

            <h3 className="text-base font-semibold text-[#0a0a0a] mt-6 mb-2">Information collected automatically</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#3a3a3a]">
              <li><strong>Usage data</strong> — pages visited, features used, audit runs initiated, timestamps, and click interactions.</li>
              <li><strong>Device &amp; log data</strong> — IP address, browser type, operating system, and referring URLs.</li>
              <li><strong>Cookies</strong> — session cookies required for authentication and preference cookies to remember your settings. See Section 6 for details.</li>
            </ul>

            <h3 className="text-base font-semibold text-[#0a0a0a] mt-6 mb-2">Information from third parties</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#3a3a3a]">
              <li><strong>Website content</strong> — when you submit a URL for an audit, we fetch publicly available content from that website to generate your AI visibility report.</li>
              <li><strong>AI model responses</strong> — we send audit prompts to third-party AI APIs (OpenAI, Google Gemini) and store their responses as part of your audit results.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your account and provide the Service.</li>
              <li>To run AI visibility audits and return results to you.</li>
              <li>To send transactional emails (audit completion, account notices, billing receipts).</li>
              <li>To improve the accuracy and features of the Service through aggregate analysis.</li>
              <li>To prevent fraud, abuse, and security incidents.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal data to third parties. We do not use your brand profile data to train
              third-party AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">3. How We Share Your Information</h2>
            <p className="mb-4">We share information only in the following limited circumstances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Service providers</strong> — Supabase (database &amp; auth), Stripe (payments), Firecrawl (web scraping), OpenAI and Google (AI inference). Each is contractually bound to use data only to provide services to us.</li>
              <li><strong>Legal requirements</strong> — if required by law, court order, or governmental authority.</li>
              <li><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, with appropriate confidentiality protections.</li>
              <li><strong>With your consent</strong> — for any other purpose with your explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">4. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Audit results are retained for
              12 months from the date of the audit unless you delete them earlier. You may request deletion of
              your account and associated data at any time by emailing{" "}
              <a href="mailto:rayanebenchaalal@gmail.com" className="text-[#5B2D91] hover:underline">rayanebenchaalal@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">5. Security</h2>
            <p>
              We implement industry-standard security measures including TLS encryption in transit, encrypted
              storage at rest, and access controls. No method of transmission over the internet is 100% secure;
              we cannot guarantee absolute security but we take reasonable steps to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">6. Cookies</h2>
            <p className="mb-4">We use the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Strictly necessary</strong> — session and authentication tokens required for the Service to function.</li>
              <li><strong>Functional</strong> — remember your preferences (e.g. sidebar state, active filters).</li>
              <li><strong>Analytics</strong> — aggregate, anonymised usage statistics to help us improve the product.</li>
            </ul>
            <p className="mt-4">
              You can disable non-essential cookies in your browser settings. Doing so may affect certain features
              of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">7. Your Rights</h2>
            <p className="mb-4">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li>Restrict or object to certain processing.</li>
              <li>Export your data in a portable format.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:rayanebenchaalal@gmail.com" className="text-[#5B2D91] hover:underline">rayanebenchaalal@gmail.com</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">8. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to children under 16. We do not knowingly collect personal data from
              children. If we become aware we have collected such data, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by
              email or by posting a notice in the Service. Continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">10. Contact</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <address className="not-italic mt-4 bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-5 py-4 text-sm">
              <strong>Comly AI</strong><br />
              Email:{" "}
              <a href="mailto:rayanebenchaalal@gmail.com" className="text-[#5B2D91] hover:underline">rayanebenchaalal@gmail.com</a>
            </address>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#f0f0f0] py-8 px-6 mt-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-[#aaaaaa]">© 2026 Comly AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-[#5B2D91] font-medium">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
