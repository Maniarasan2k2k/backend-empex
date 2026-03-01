/**
 * ============================================================
 * sendEmailSES.js — AWS SES Email Utility (via SMTP)
 * ============================================================
 * Uses Nodemailer with AWS SES SMTP credentials.
 * Works in both Sandbox (verified emails only) and Production.
 *
 * ENV vars required in .env:
 *   SES_SMTP_HOST        e.g. email-smtp.ap-south-1.amazonaws.com
 *   SES_SMTP_PORT        465 (SSL) or 587 (TLS/STARTTLS)
 *   SES_SMTP_USER        SMTP username from SES console
 *   SES_SMTP_PASS        SMTP password from SES console
 *   SES_FROM_EMAIL       e.g. noreply@empexindia.com
 *   SES_FROM_NAME        e.g. EmpEx Jobs
 * ============================================================
 */

const nodemailer = require('nodemailer');

// ── Create transporter ──────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SES_SMTP_HOST || 'email-smtp.ap-south-1.amazonaws.com',
    port: parseInt(process.env.SES_SMTP_PORT) || 465,
    secure: parseInt(process.env.SES_SMTP_PORT) === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
    auth: {
        user: process.env.SES_SMTP_USER,
        pass: process.env.SES_SMTP_PASS,
    },
});

const FROM_ADDRESS = `"${process.env.SES_FROM_NAME || 'EmpEx Jobs'}" <${process.env.SES_FROM_EMAIL || 'noreply@empexindia.com'}>`;

// ============================================================
// 📧 Send OTP Email
// ============================================================
const sendOtpEmail = async ({ to, name, otp, role }) => {
    const roleLabel = role === 'employee' ? 'Employer' : 'Candidate';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Your OTP - EmpEx Jobs</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1a237e 0%, #283593 100%); padding: 36px 40px; text-align: center; }
        .header img { height: 40px; margin-bottom: 12px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 40px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 16px; }
        .otp-box { background: linear-gradient(135deg, #e8eaf6, #e3f2fd); border: 2px dashed #3949ab; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 13px; color: #5c6bc0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 8px; }
        .otp-code { font-size: 48px; font-weight: 800; color: #1a237e; letter-spacing: 12px; line-height: 1; }
        .otp-note { font-size: 12px; color: #9e9e9e; margin-top: 10px; }
        .info { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 20px; }
        .warning { background: #fff8e1; border-left: 4px solid #ffc107; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #795548; margin-top: 8px; }
        .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 12px; color: #9e9e9e; margin: 4px 0; }
        .footer a { color: #3949ab; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>EmpEx Jobs</h1>
          <p>Your Career, Our Mission</p>
        </div>
        <div class="body">
          <p class="greeting">Hello <strong>${name || 'there'}</strong>,</p>
          <p class="info">
            You are registering as a <strong>${roleLabel}</strong> on EmpEx Jobs. 
            Use the OTP below to verify your email address and complete your registration.
          </p>
          <div class="otp-box">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-note">⏱ This OTP is valid for <strong>10 minutes</strong> only</div>
          </div>
          <div class="warning">
            🔒 <strong>Do not share this OTP</strong> with anyone. EmpEx Jobs will never ask for your OTP via call or message.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EmpEx Jobs | <a href="https://empexindia.com">empexindia.com</a></p>
          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: FROM_ADDRESS,
        to,
        subject: `${otp} is your EmpEx Jobs OTP — Valid for 10 mins`,
        html,
        text: `Hello ${name || 'there'},\n\nYour EmpEx Jobs OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.\n\n— EmpEx Jobs Team`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${to} | MessageId: ${info.messageId}`);
        return { success: true };
    } catch (err) {
        console.error(`❌ OTP Email Error (${to}):`, err.message);
        return { success: false, error: err.message };
    }
};

// ============================================================
// 🎉 Send Welcome Email (after successful registration)
// ============================================================
const sendWelcomeEmail = async ({ to, name, role }) => {
    const roleLabel = role === 'employee' ? 'Employer' : 'Candidate';
    const dashboardUrl = role === 'employee'
        ? 'https://empexindia.com/employer/dashboard'
        : 'https://empexindia.com/candidate/dashboard';

    const tips = role === 'employee'
        ? [
            '📋 <strong>Post your first job</strong> — Reach thousands of active job seekers',
            '🏢 <strong>Complete your company profile</strong> — Build trust with candidates',
            '📊 <strong>Track applications</strong> — Manage hiring from one place',
        ]
        : [
            '📝 <strong>Complete your profile</strong> — Get noticed by top employers',
            '🔍 <strong>Explore jobs</strong> — Find opportunities that match your skills',
            '🔔 <strong>Set job alerts</strong> — Never miss a relevant opening',
        ];

    const tipsHtml = tips.map(t => `<li style="margin-bottom:10px;">${t}</li>`).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to EmpEx Jobs!</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .hero { background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%); padding: 50px 40px; text-align: center; }
        .emoji { font-size: 56px; margin-bottom: 16px; display: block; }
        .hero h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; }
        .hero p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 12px; padding: 4px 14px; border-radius: 20px; margin-top: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .body { padding: 40px; }
        .greeting { font-size: 17px; color: #222; margin-bottom: 16px; font-weight: 600; }
        .intro { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 28px; }
        .tips-title { font-size: 14px; font-weight: 700; color: #1a237e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .tips { list-style: none; padding: 0; margin: 0 0 28px; font-size: 14px; color: #444; line-height: 1.6; }
        .cta { text-align: center; margin: 32px 0; }
        .cta a { background: linear-gradient(135deg, #1a237e, #283593); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 700; display: inline-block; letter-spacing: 0.5px; }
        .divider { border: none; border-top: 1px solid #eee; margin: 28px 0; }
        .support { font-size: 13px; color: #888; text-align: center; margin-bottom: 4px; }
        .support a { color: #3949ab; text-decoration: none; }
        .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 12px; color: #9e9e9e; margin: 4px 0; }
        .footer a { color: #3949ab; text-decoration: none; }
        .social { margin-top: 12px; }
        .social a { margin: 0 6px; font-size: 12px; color: #5c6bc0; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="hero">
          <span class="emoji">🎉</span>
          <h1>Welcome to EmpEx Jobs!</h1>
          <p>Your account has been successfully created</p>
          <span class="badge">${roleLabel}</span>
        </div>
        <div class="body">
          <p class="greeting">Hello ${name || 'there'}, welcome aboard! 👋</p>
          <p class="intro">
            We're thrilled to have you join the <strong>EmpEx Jobs</strong> community. 
            Your journey ${role === 'employee' ? 'to finding the perfect talent' : 'towards your dream career'} starts right here.
          </p>

          <div class="tips-title">🚀 Get Started — Here's What to Do Next</div>
          <ul class="tips">
            ${tipsHtml}
          </ul>

          <div class="cta">
            <a href="${dashboardUrl}">Go to My Dashboard →</a>
          </div>

          <hr class="divider" />
          <p class="support">Need help? We're always here — <a href="mailto:support@empexindia.com">support@empexindia.com</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EmpEx Jobs | <a href="https://empexindia.com">empexindia.com</a></p>
          <p>You received this email because you registered on EmpEx Jobs.</p>
          <div class="social">
            <a href="#">LinkedIn</a> · <a href="#">Instagram</a> · <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: FROM_ADDRESS,
        to,
        subject: `🎉 Welcome to EmpEx Jobs, ${name || 'there'}! Your account is ready`,
        html,
        text: `Hello ${name || 'there'},\n\nWelcome to EmpEx Jobs!\n\nYour ${roleLabel} account has been successfully created.\n\nVisit your dashboard: ${dashboardUrl}\n\n— EmpEx Jobs Team`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${to} | MessageId: ${info.messageId}`);
        return { success: true };
    } catch (err) {
        console.error(`❌ Welcome Email Error (${to}):`, err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { sendOtpEmail, sendWelcomeEmail };
