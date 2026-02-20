import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Use test account if no SMTP configured
    transporter = nodemailer.createTestAccount().then(testAccount => {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    });
  }

  return transporter;
}

export async function sendEmail(to, subject, html) {
  try {
    const mailer = await getTransporter();
    const result = await mailer.sendMail({
      from: process.env.SMTP_FROM || 'noreply@farmingtechshop.com',
      to,
      subject,
      html,
    });

    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

export async function sendOrderConfirmation(email, order) {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>Total Amount:</strong> ₹${order.final_amount}</p>
    <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
    <p>Your order is being processed and will be shipped soon.</p>
    <p>Thank you for shopping with Farming Tech Shop!</p>
  `;

  return sendEmail(email, 'Order Confirmation', html);
}

export async function sendOrderStatusUpdate(email, order) {
  const html = `
    <h2>Order Status Update</h2>
    <p><strong>Order Number:</strong> ${order.order_number}</p>
    <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
    <p><strong>Updated:</strong> ${new Date(order.updated_at).toLocaleDateString()}</p>
  `;

  return sendEmail(email, 'Order Status Update', html);
}
