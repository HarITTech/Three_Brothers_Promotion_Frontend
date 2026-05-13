import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Skeleton from './Skeleton';
import './FaqSection.css';

const FAQS = [
  {
    q: "I don't have time to shoot content every week. How will this work for me?",
    a: <>You don't have to. We shoot all your reels for the month in just <span className="highlight">two dedicated studio days</span>. <span className="highlight">Everything—from setup to direction</span> is handled by our team.</>,
  },
  {
    q: "I'm not good on camera. Will I still be able to do this?",
    a: <>Absolutely. You <span className="highlight">don't need to remember lines or act</span>. Our prompt director stands right in front of you during the shoot and <span className="highlight">guides you line by line</span>. Most of our clients had <span className="highlight">zero on‑camera experience</span> before starting.</>,
  },
  {
    q: "I don't know what to talk about or what kind of content will work for me.",
    a: <>That's our job. We do <span className="highlight">full research on your niche, competitors, and audience</span>, and then create <span className="highlight">25–30 targeted scripts</span> for you every month, all <span className="highlight">aligned with your goals</span>.</>,
  },
  {
    q: "Will this actually get me followers or just good‑looking videos?",
    a: <>Our focus is <span className="highlight">growth</span>, not just aesthetics. Every script, hook, and call‑to‑action is designed for <span className="highlight">reach, engagement, and conversion</span>. The Domination plan even comes with a <span className="highlight">100% refund guarantee</span> if you don't hit <span className="highlight">100K followers</span> in 6 months.</>,
  },
  {
    q: "What if I don't have a clear niche or business idea yet?",
    a: <>No problem. During onboarding, we help you find your <span className="highlight">niche, sub‑niche, and positioning</span>, so your content speaks to the <span className="highlight">right audience</span> and <span className="highlight">builds authority</span>.</>,
  },
  {
    q: "I already post but don't see results. How will this be different?",
    a: <><span className="highlight">Most people post without strategy</span>. We build your content around <span className="highlight">data, trends, and audience psychology</span>—the same system that's helped multiple creators grow to <span className="highlight">100K+ followers</span>.</>,
  },
  {
    q: "How involved do I have to be in the process?",
    a: <>You just need to be present for the <span className="highlight">2 shoot days</span> each month. Our team <span className="highlight">handles everything else: scripting, directing, editing, and strategy</span>.</>,
  },
  {
    q: "What if I don't like the final edits or the tone?",
    a: <><span className="highlight">We share previews</span>, take your feedback, and <span className="highlight">revise until you're happy</span>. Our editors ensure the videos <span className="highlight">match your brand and comfort level perfectly</span>.</>,
  },
  {
    q: "Is this service only for influencers or also for business owners?",
    a: <>Both. Whether you want to grow your <span className="highlight">personal brand</span> or <span className="highlight">generate sales for your business</span>, we <span className="highlight">tailor the strategy</span> to your <span className="highlight">specific goals</span>.</>,
  },
  {
    q: "What's the investment like?",
    a: <>Our <span className="highlight">done-for-you service is priced at ₹4,00,000 per month</span>. This includes everything—<span className="highlight">scripting, shooting, editing, strategy, and posting</span>. You just show up for <span className="highlight">2 days a month</span>, and we handle the rest to grow your brand.</>,
  },
  {
    q: 'What is the "Minimum Guarantee" everyone\'s talking about?',
    a: <>We're the only agency that backs its promise with a <span className="highlight">real guarantee</span>. If we don't help you reach <span className="highlight">100K followers within 6 months</span>, we <span className="highlight">continue working with you for 2 extra months</span>, completely free. And if we still don't hit that mark, you get <span className="highlight">every single rupee refunded</span>. <span className="highlight">No fine print, no excuses. Just results or your money back.</span></>,
  },
  {
    q: "Why should I hire a Personal Branding Consultant instead of a general agency?",
    a: "A dedicated consultant like ours focuses on your unique voice, ensuring you don't just get views, but build true authority.",
  },
];

export default function FaqSection() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getSectionData('faqs-section');
        if (data) setApiData(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeFaqs = apiData?.faqData?.length > 0
    ? apiData.faqData.map((f) => ({
        q: f.que,
        a: f.ans
      }))
    : (loading ? [] : FAQS);

  return (
    <div className="faq-section-wrapper" id="faq">
      <section className="faq-section">
        <div className="faq-glow faq-glow-left" />
        <div className="faq-glow faq-glow-right" />

        <div className="faq-header">
          <div className="faq-badge">
            {loading ? <Skeleton width="120px" height="1em" /> : (apiData?.faqTag || 'GOT QUESTIONS?')}
          </div>
          <h2 className="faq-title">
            {loading ? (
              <Skeleton width="60%" height="1.5em" />
            ) : apiData?.heading1 ? (
              <>
                {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
              </>
            ) : (
              <>
                Frequently Asked <span className="gradient-text">Questions</span>
              </>
            )}
          </h2>
          <p className="faq-desc">
            {loading ? <Skeleton width="80%" /> : (apiData?.desc || 'Everything you need to know about our service')}
          </p>
        </div>

        <div className="faq-container">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="faq-item" style={{ padding: '20px' }}>
                <Skeleton width="90%" height="1.2em" />
              </div>
            ))
          ) : activeFaqs.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>
                {item.q}
                <div className="faq-icon"><i className="fa-solid fa-chevron-down" /></div>
              </summary>
              <div className="faq-content">
                {typeof item.a === 'string' && item.a.includes('<span') ? (
                  <span dangerouslySetInnerHTML={{ __html: item.a }} />
                ) : (
                  item.a
                )}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
