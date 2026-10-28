import { contentStore } from './contentStore';

const OFF_TOPIC =
  'I can help with Teja Web Studio services, website projects, pricing, timelines, bookings and quotations. What would you like to know about those?';
const UNAVAILABLE =
  'I could not answer that right now. Please leave your website question here or reach us via WhatsApp at +91 94909 55048.';

// A deterministic gate limits which messages are sent to the model.
export function isStudioQuestion(message: string, recentClientMessages: string[] = []): boolean {
  if (
    /\b(?:capital of|weather|recipe|sports? scores?|politics|elections?|stock price|medical advice|write (?:code|a poem)|ignore (?:your|previous) instructions|reveal (?:your|the) prompt)\b/i.test(
      message,
    )
  )
    return false;
  const terms =
    /\b(websites?|web\s*(?:design|development|site)|sites?|pages?|domains?|hosting|seo|e-?commerce|online\s+store|portfolio|redesign|maintenance|services?|packages?|plans?|prices?|pricing|costs?|budgets?|quotes?|quotations?|proposals?|projects?|bookings?|appointments?|consultations?|timelines?|delivery|features?|contact|studio|teja|business)\b/i;
  if (terms.test(message)) return true;
  const shortFollowUp = message.trim().split(/\s+/).length <= 8;
  return shortFollowUp && recentClientMessages.some((item) => terms.test(item));
}

export async function answerStudioQuestion(
  message: string,
  recentClientMessages: string[] = [],
): Promise<string> {
  if (!isStudioQuestion(message, recentClientMessages)) return OFF_TOPIC;
  let fallback = UNAVAILABLE;

  try {
    const services = contentStore.getServices();
    const plans = contentStore.getPricingPlans();
    const faqs = contentStore.getFaqs();
    const settings = contentStore.getSettings();

    fallback = (() => {
      if (/\b(prices?|pricing|costs?|budgets?|packages?|plans?)\b/i.test(message) && plans.length)
        return `Current website packages: ${plans.map((plan) => `${plan.name} ($${plan.price}, ${plan.billingCycle})`).join('; ')}. See the Pricing page or request a quotation for your project.`;
      if (/\b(timelines?|delivery|how long)\b/i.test(message)) {
        const delivery = faqs.find((faq) => /how long|deliver/i.test(faq.question));
        if (delivery) return delivery.answer;
      }
      if (/\b(bookings?|appointments?|consultations?)\b/i.test(message))
        return 'You can choose an available consultation time on the Booking page, or reach out directly on WhatsApp at +91 94909 55048.';
      if (/\b(quotes?|quotations?|proposals?)\b/i.test(message))
        return 'You can describe your website project and request a quotation on the Quote page. Our team syncs leads directly to Zoho CRM.';
      if (/\b(contact|email)\b/i.test(message) && settings?.contactEmail)
        return `You can contact the studio at ${settings.contactEmail} or on WhatsApp at +91 94909 55048.`;
      if (services.length)
        return `Our published website services include ${services.map((service) => service.title).join(', ')}. Tell me which service or project you are interested in!`;
      return UNAVAILABLE;
    })();

    if (!process.env.OPENROUTER_API_KEY) return fallback;

    const facts = JSON.stringify({ services, plans, faqs, settings }).slice(0, 14000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response: globalThis.Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Teja Web Studio Chat',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'openrouter/free',
          messages: [
            {
              role: 'system',
              content: `You are the polite website assistant for Teja Web Studio. Use ONLY these verified studio facts: ${facts}. Be concise, friendly, and helpful.`,
            },
            { role: 'user', content: message },
          ],
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) return fallback;
    const body: any = await response.json();
    return body?.choices?.[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
