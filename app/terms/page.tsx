'use client';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();
  return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh', padding: '0 0 60px', color: '#1A1A2E', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '56px 16px 12px', position: 'sticky', top: 0, background: 'rgba(250,248,245,0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(26,26,46,0.08)', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FB471F', fontSize: 17, background: 'none', padding: 0 }}>
          <svg width="10" height="17" fill="none" viewBox="0 0 10 17">
            <path d="M9 1L1 8.5 9 16" stroke="#FB471F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Settings
        </button>
      </div>
      <div style={{ padding: '24px 20px 0' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Terms of Service</h1>
        <p style={{ color: '#9B9490', fontSize: 13, marginBottom: 32 }}>Last updated: April 11, 2026</p>
        {[
          { title: 'Acceptance of Terms', body: 'By using FlipAlert, you agree to these Terms of Service. If you do not agree, please do not use the app.' },
          { title: 'Description of Service', body: 'FlipAlert is a deal alert service that notifies users of vehicle listings matching their search criteria. We do not sell vehicles and are not responsible for any transactions between buyers and sellers.' },
          { title: 'Account Responsibility', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.' },
          { title: 'Subscription & Billing', body: 'FlipAlert offers a free trial and paid subscription plans. Subscriptions renew automatically unless cancelled. You may cancel at any time through the App Store or Google Play account settings.' },
          { title: 'Acceptable Use', body: 'You agree not to misuse the service, attempt to access it by unauthorized means, or use it for any illegal purpose. We reserve the right to suspend or terminate accounts that violate these terms.' },
          { title: 'Disclaimer of Warranties', body: 'FlipAlert is provided "as is." We do not guarantee the accuracy, completeness, or timeliness of any listing data. Vehicle valuations are estimates only and should not be relied upon as professional financial advice.' },
          { title: 'Limitation of Liability', body: 'FlipAlert is not liable for any indirect, incidental, or consequential damages arising from your use of the app or any transactions made based on alerts received.' },
          { title: 'Changes to Terms', body: 'We may update these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.' },
          { title: 'Contact', body: 'For questions about these terms, contact us at support@flipalert.app.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#9B9490' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
