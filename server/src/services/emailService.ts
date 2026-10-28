import { escapeHtml } from '../utils/security';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

if (env.EMAIL_SERVICE_ENABLED && env.SMTP_HOST && env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  console.log('[EmailService] SMTP Transporter configured.');
} else {
  console.log(
    '[EmailService] Running in Development/Audit mode (emails logged to server console).',
  );
}

export interface SendEmailOptions {
  referenceId?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Message sent to ${options.to}: ${info.messageId}`);
      return true;
    } catch (err: any) {
      console.error(`[Email Error] Failed to send email via SMTP: ${err.message}`);
      return false;
    }
  } else {
    // Development fallback
    console.log(`\n--- [SIMULATED EMAIL DISPATCH] ---`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html.substring(0, 160)}...`);
    console.log(`----------------------------------\n`);
    return true;
  }
};

export const emailTemplates = {
  inquiryConfirmation: (clientName: string, subject: string) => ({
    subject: `We've received your message — Teja Web Studio`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Teja Web Studio</h2>
        <p>Hi ${escapeHtml(clientName)},</p>
        <p>Thank you for reaching out to us regarding "<strong>${escapeHtml(subject)}</strong>".</p>
        <p>We have safely received your inquiry and are reviewing your project requirements. You can expect a response from us within <strong>24 business hours</strong>.</p>
        <p>For urgent questions, feel free to WhatsApp us directly at <a href="https://wa.me/919490955048">+91 94909 55048</a>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
        <p style="color: #64748b; font-size: 13px;">Teja Web Studio &bull; Simple, Affordable Websites for Small Businesses</p>
      </div>
    `,
  }),

  quotationConfirmation: (clientName: string, projectType: string, budgetRange: string) => ({
    subject: `Your Project Quotation Request — Teja Web Studio`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Teja Web Studio</h2>
        <p>Hi ${escapeHtml(clientName)},</p>
        <p>Thank you for requesting a proposal for your <strong>${escapeHtml(projectType)}</strong> project.</p>
        <div style="background: #ffffff; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Scope:</strong> ${escapeHtml(projectType)}</p>
          <p style="margin: 0;"><strong>Estimated Budget:</strong> ${escapeHtml(budgetRange)}</p>
        </div>
        <p>We are reviewing your feature requirements and preparing an initial sprint breakdown and timeline for you.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
        <p style="color: #64748b; font-size: 13px;">Teja Web Studio &bull; Simple, Affordable Websites for Small Businesses</p>
      </div>
    `,
  }),

  adminNewNotification: (type: string, details: string) => ({
    subject: `🔔 New ${type} Notification`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 8px;">
        <h2 style="color: #4f46e5;">New Website Event: ${escapeHtml(type)}</h2>
        <pre style="background: #ffffff; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px; font-family: monospace; font-size: 13px; white-space: pre-wrap;">${escapeHtml(details)}</pre>
        <p style="color: #64748b; font-size: 12px; margin-top: 15px;">Automated alert from Teja Web Studio</p>
      </div>
    `,
  }),
};
