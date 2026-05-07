const nodemailer = require('nodemailer');

// ── Create transporter ────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Base HTML email layout ────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CoWork Platform</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:16px 16px 0 0;padding:32px 40px;border-bottom:1px solid #334155;">
              <table width="100%">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <div style="width:36px;height:36px;background:#d97706;border-radius:10px;display:inline-block;text-align:center;line-height:36px;font-size:18px;">🏢</div>
                      <span style="font-size:22px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;vertical-align:middle;margin-left:10px;">CoWork</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:40px;border-radius:0 0 16px 16px;">
              ${content}
              <!-- Footer -->
              <table width="100%" style="margin-top:40px;padding-top:24px;border-top:1px solid #334155;">
                <tr>
                  <td style="text-align:center;">
                    <p style="color:#64748b;font-size:12px;margin:0;">
                      © ${new Date().getFullYear()} CoWork Platform. All rights reserved.<br/>
                      This email was sent because you have an account on CoWork Platform.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Reusable styled button ────────────────────────────────────────────────────
const ctaButton = (text, url) => `
  <table width="100%" style="margin:28px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;background:#d97706;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

// ── Status badge ─────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const map = {
    approved:  { bg: '#064e3b', color: '#34d399', text: '✓ Approved' },
    rejected:  { bg: '#7f1d1d', color: '#f87171', text: '✗ Rejected' },
    pending:   { bg: '#451a03', color: '#fbbf24', text: '⏳ Pending' },
    cancelled: { bg: '#1e293b', color: '#94a3b8', text: '⊘ Cancelled' },
  };
  const s = map[status] || map.pending;
  return `<span style="background:${s.bg};color:${s.color};padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">${s.text}</span>`;
};

// ── Email Templates ───────────────────────────────────────────────────────────

/**
 * Welcome email after registration
 */
const welcomeEmail = ({ name, role }) => ({
  subject: `Welcome to CoWork, ${name}! 🎉`,
  html: baseTemplate(`
    <h1 style="color:#f8fafc;font-size:28px;font-weight:700;margin:0 0 8px;">Welcome aboard, ${name}!</h1>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 24px;">Your account has been created successfully as a <strong style="color:#d97706;text-transform:capitalize;">${role}</strong>.</p>

    <div style="background:#0f172a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #334155;">
      <p style="color:#f8fafc;font-size:15px;margin:0 0 16px;font-weight:600;">Here's what you can do:</p>
      ${role === 'user' ? `
        <p style="color:#94a3b8;margin:8px 0;">🔍 Search and filter co-working spaces</p>
        <p style="color:#94a3b8;margin:8px 0;">📅 Book spaces hourly, daily, or monthly</p>
        <p style="color:#94a3b8;margin:8px 0;">🔔 Get real-time booking status updates</p>
      ` : `
        <p style="color:#94a3b8;margin:8px 0;">🏢 List and manage your co-working spaces</p>
        <p style="color:#94a3b8;margin:8px 0;">✅ Approve or reject booking requests</p>
        <p style="color:#94a3b8;margin:8px 0;">📊 Track revenue and occupancy</p>
      `}
    </div>

    ${ctaButton('Explore Spaces →', `${process.env.CLIENT_URL}/spaces`)}
  `),
});

/**
 * Booking confirmation to user
 */
const bookingConfirmationEmail = ({ userName, spaceName, spaceCity, startDate, endDate, bookingType, totalAmount, bookingId }) => ({
  subject: `Booking Request Received — ${spaceName}`,
  html: baseTemplate(`
    <h1 style="color:#f8fafc;font-size:26px;font-weight:700;margin:0 0 8px;">Booking Request Sent</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;">Hi ${userName}, your booking request has been sent to the space owner. You'll be notified once it's reviewed.</p>

    <div style="background:#0f172a;border-radius:12px;padding:28px;border:1px solid #334155;">
      <p style="color:#d97706;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Booking Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Space</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${spaceName}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Location</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${spaceCity}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Check-in</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${new Date(startDate).toLocaleDateString('en-IN', { day:'numeric',month:'long',year:'numeric' })}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Check-out</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${new Date(endDate).toLocaleDateString('en-IN', { day:'numeric',month:'long',year:'numeric' })}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Type</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;text-transform:capitalize;">${bookingType}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:12px 0 0;">Total Amount</td>
            <td style="color:#d97706;font-size:20px;font-weight:700;text-align:right;padding:12px 0 0;">₹${Number(totalAmount).toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    <div style="margin:24px 0;padding:16px 20px;background:#451a03;border-radius:10px;border-left:3px solid #d97706;">
      <p style="color:#fbbf24;font-size:14px;margin:0;">Status: ${statusBadge('pending')} — Awaiting owner approval</p>
    </div>

    ${ctaButton('View Booking →', `${process.env.CLIENT_URL}/dashboard`)}
  `),
});

/**
 * Booking status update (approved / rejected)
 */
const bookingStatusEmail = ({ userName, spaceName, status, statusNote, startDate, endDate, totalAmount }) => ({
  subject: `Booking ${status === 'approved' ? 'Approved ✓' : 'Update'} — ${spaceName}`,
  html: baseTemplate(`
    <h1 style="color:#f8fafc;font-size:26px;font-weight:700;margin:0 0 8px;">
      ${status === 'approved' ? '🎉 Your Booking is Confirmed!' : 'Booking Status Update'}
    </h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;">
      Hi ${userName}, your booking for <strong style="color:#f8fafc;">${spaceName}</strong> has been ${status === 'approved' ? 'confirmed by the space owner.' : 'reviewed.'}
    </p>

    <div style="text-align:center;margin:28px 0;">
      ${statusBadge(status)}
    </div>

    <div style="background:#0f172a;border-radius:12px;padding:28px;border:1px solid #334155;">
      <table width="100%">
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Space</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${spaceName}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Dates</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">
              ${new Date(startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – ${new Date(endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
            </td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:12px 0 0;">Amount</td>
            <td style="color:#d97706;font-size:18px;font-weight:700;text-align:right;padding:12px 0 0;">₹${Number(totalAmount).toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    ${statusNote ? `
      <div style="margin:20px 0;padding:16px 20px;background:#1e293b;border-radius:10px;border-left:3px solid #475569;">
        <p style="color:#94a3b8;font-size:14px;margin:0;"><strong style="color:#f8fafc;">Note from owner:</strong> ${statusNote}</p>
      </div>
    ` : ''}

    ${status === 'approved' ? ctaButton('View Booking Details →', `${process.env.CLIENT_URL}/dashboard`) : ''}
  `),
});

/**
 * New booking notification to owner
 */
const newBookingNotifyOwner = ({ ownerName, userName, userCompany, spaceName, startDate, endDate, numberOfPersons, totalAmount }) => ({
  subject: `New Booking Request — ${spaceName}`,
  html: baseTemplate(`
    <h1 style="color:#f8fafc;font-size:26px;font-weight:700;margin:0 0 8px;">New Booking Request</h1>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;">Hi ${ownerName}, you have a new booking request for <strong style="color:#f8fafc;">${spaceName}</strong> that needs your review.</p>

    <div style="background:#0f172a;border-radius:12px;padding:28px;border:1px solid #334155;">
      <p style="color:#d97706;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Request Details</p>
      <table width="100%">
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">From</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${userName}${userCompany ? ` · ${userCompany}` : ''}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Dates</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">
              ${new Date(startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – ${new Date(endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
            </td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:8px 0;border-bottom:1px solid #1e293b;">Persons</td>
            <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1e293b;">${numberOfPersons}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:12px 0 0;">Total</td>
            <td style="color:#d97706;font-size:20px;font-weight:700;text-align:right;padding:12px 0 0;">₹${Number(totalAmount).toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    ${ctaButton('Review Request in Dashboard →', `${process.env.CLIENT_URL}/owner/dashboard`)}

    <p style="color:#64748b;font-size:13px;text-align:center;">Please respond within 24 hours to keep your response rate high.</p>
  `),
});

// ── Send Function ─────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  // Skip silently if email credentials not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email skipped — no credentials] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `CoWork Platform <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email sent] To: ${to} | Subject: ${subject}`);
  } catch (err) {
    // Log but don't crash the app
    console.error(`[Email error] ${err.message}`);
  }
};

module.exports = {
  sendEmail,
  welcomeEmail,
  bookingConfirmationEmail,
  bookingStatusEmail,
  newBookingNotifyOwner,
};
