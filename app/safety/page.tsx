export const metadata = {
  title: 'Safety Hub - Dinewith'
}

export default function SafetyHubPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Safety & Community Guidelines</h1>
        <p className="text-lg text-muted-foreground">
          Dinewith is committed to creating a safe, welcoming environment for everyone who shares meals together.
        </p>
      </div>

      {/* Core Principles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
        <div className="prose prose-gray max-w-none">
          <p>
            We believe that breaking bread together should be a positive, enriching experience. 
            Our platform is built on trust, respect, and authentic human connection.
          </p>
        </div>
      </section>

      {/* What We Are */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What Dinewith Is</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">✅ A Food & Social Platform</h3>
            <p className="text-sm text-muted-foreground">
              For people who love food and want to share meals, cooking experiences, and dining companionship.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">✅ PG-13 Content</h3>
            <p className="text-sm text-muted-foreground">
              All content must be appropriate for a general audience. Think Food Network, not adult entertainment.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">✅ Curated Marketplace</h3>
            <p className="text-sm text-muted-foreground">
              All hosts are manually reviewed and approved before they can offer services.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">✅ Human Moderation</h3>
            <p className="text-sm text-muted-foreground">
              Real people review reports and content to maintain community standards.
            </p>
          </div>
        </div>
      </section>

      {/* What We Are Not */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What Dinewith Is NOT</h2>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <p className="font-semibold mb-4">The following are explicitly prohibited:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Dating services</strong> - This is not Tinder or a dating app</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Adult/escort services</strong> - No sexualized content or services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Nudity or sexual content</strong> - Keep it family-friendly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Minors</strong> - Must be 18+ to use the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">❌</span>
              <span><strong>Illegal activities</strong> - No exceptions</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Safety Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How We Keep You Safe</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold mb-2">Identity Verification</h3>
            <p className="text-sm text-muted-foreground">
              All hosts must complete identity verification before offering services.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">Manual Review</h3>
            <p className="text-sm text-muted-foreground">
              Every host application and listing is reviewed by our moderation team.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-3xl mb-2">🚨</div>
            <h3 className="font-semibold mb-2">Report System</h3>
            <p className="text-sm text-muted-foreground">
              Easy-to-use reporting tools with real human review of every report.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              All payments processed through trusted payment processors with buyer protection.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="font-semibold mb-2">Review System</h3>
            <p className="text-sm text-muted-foreground">
              Transparent reviews help build trust and accountability in the community.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-3xl mb-2">📹</div>
            <h3 className="font-semibold mb-2">VOD Auto-Deletion</h3>
            <p className="text-sm text-muted-foreground">
              Stream recordings automatically deleted after 7 days for privacy.
            </p>
          </div>
        </div>
      </section>

      {/* How to Report */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Report a Problem</h2>
        <div className="border rounded-lg p-6">
          <p className="mb-4">
            If you encounter content or behavior that violates our guidelines, please report it immediately:
          </p>
          <ol className="space-y-3 list-decimal list-inside">
            <li>Click the &quot;Report&quot; button on any listing, stream, message, or user profile</li>
            <li>Select the reason for your report</li>
            <li>Provide a detailed description of the issue</li>
            <li>Our moderation team will review within 24 hours</li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            All reports are confidential. We take every report seriously and will take appropriate action.
          </p>
        </div>
      </section>

      {/* Enforcement */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Enforcement</h2>
        <div className="prose prose-gray max-w-none">
          <p>
            Violations of our community guidelines may result in:
          </p>
          <ul>
            <li>Content removal</li>
            <li>Temporary suspension</li>
            <li>Permanent account termination</li>
            <li>Reporting to law enforcement (for illegal activities)</li>
          </ul>
          <p>
            We reserve the right to remove any content or suspend any account at our discretion.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Questions or Concerns?</h2>
        <p className="text-muted-foreground mb-4">
          If you have questions about safety or our community guidelines, please contact us at{' '}
          <a href="mailto:safety@dinewith.com" className="text-primary underline">
            safety@dinewith.com
          </a>
        </p>
      </section>
    </div>
  )
}
