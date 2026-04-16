'use client';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh', padding: '0 0 60px', color: '#1A1A2E', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '56px 16px 12px', position: 'sticky', top: 0, background: 'rgba(250,248,245,0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(26,26,46,0.08)', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FB471F', fontSize: 17, background: 'none', padding: 0 }}>
          <svg width="10" height="17" fill="none" viewBox="0 0 10 17">
            <path d="M9 1L1 8.5 9 16" stroke="#FB471F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Settings
        </button>
      </div>
      <div style={{ padding: '24px 20px 0' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Privacy Policy</h1>
      <p style={{ color: '#9B9490', fontSize: 13, marginBottom: 32 }}>Last updated: April 11, 2026</p>

      {[
        {
          title: 'Information We Collect',
          body: 'FlipAlert collects information you provide when creating an account, such as your name, email address, and phone number. We also collect the search preferences and alert settings you configure within the app.',
        },
        {
          title: 'How We Use Your Information',
          body: 'We use your information to send you real-time deal alerts matching your search criteria, manage your subscription, and improve the app experience. We do not sell your personal information to third parties.',
        },
        {
          title: 'Notifications',
          body: 'With your permission, FlipAlert sends push notifications and optional SMS alerts for new listings that match your searches. You can turn these off at any time in Settings or your device settings.',
        },
        {
          title: 'Permissions We Request',
          body: 'FlipAlert only requests permissions it actually needs. We request push notification permission to send you deal alerts. We do not request access to your camera, microphone, contacts, location, or photo library. We will never request permissions we do not need.',
        },
        {
          title: 'Account Deletion',
          body: 'You may request deletion of your account and all associated data at any time from the Settings screen in the app. Tap "Delete Account & Data" at the bottom of Settings. Your account and all data will be permanently deleted within 30 days of your request.',
        },
        {
          title: 'Data Storage',
          body: 'Your account data is stored securely. We use industry-standard encryption to protect your information in transit and at rest.',
        },
        {
          title: 'Third-Party Services',
          body: 'FlipAlert uses third-party services including Stripe for payment processing and Firebase for push notifications. These services have their own privacy policies and handle data according to their terms.',
        },
        {
          title: 'Data Retention',
          body: 'We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.',
        },
        {
          title: 'Children\'s Privacy',
          body: 'FlipAlert is not directed at children under 13. We do not knowingly collect personal information from children under 13.',
        },
        {
          title: 'Changes to This Policy',
          body: 'We may update this policy from time to time. We will notify you of significant changes via email or in-app notification.',
        },
        {
          title: 'Contact Us',
          body: 'If you have questions about this privacy policy, contact us at support@flipalert.app.',
        },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#1A1A2E' }}>{section.title}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#9B9490' }}>{section.body}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
