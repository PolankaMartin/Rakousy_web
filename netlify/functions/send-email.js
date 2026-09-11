const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function buildFieldsHtml(data) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== '');

  if (!entries.length) {
    return '<p>Žádné údaje nebyly odeslány.</p>';
  }

  const rows = entries.map(([key, value]) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();

    return `
      <tr>
        <th style="text-align:left; padding:0.5rem 0.75rem; border-bottom:1px solid #e5e7eb; vertical-align:top;">${escapeHtml(label)}</th>
        <td style="padding:0.5rem 0.75rem; border-bottom:1px solid #e5e7eb;">${escapeHtml(String(value))}</td>
      </tr>
    `;
  }).join('');

  return `
    <table style="width:100%; border-collapse:collapse; font-family:Arial,sans-serif; color:#1f2937;">
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createEmailBody(formType, data) {
  const normalizedType = formType === 'registrationForm' ? 'registration' : 'contact';
  const subject = normalizedType === 'registration'
    ? 'Nová přihláška na tábor Rakousy'
    : 'Nová zpráva z webu Rakousy';

  const heading = normalizedType === 'registration'
    ? 'Přihláška na tábor'
    : 'Zpráva z kontaktního formuláře';

  const htmlContent = `
    <div style="font-family:Arial,sans-serif; color:#1f2937; line-height:1.6;">
      <h2 style="margin:0 0 1rem; color:#2e7d32;">${heading}</h2>
      ${buildFieldsHtml(data)}
    </div>
  `;

  const textContent = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return { subject, htmlContent, textContent: textContent || 'Žádné údaje nebyly odeslány.' };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL;

  if (!apiKey || !senderEmail || !recipientEmail) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Missing Netlify environment variables: BREVO_API_KEY, BREVO_SENDER_EMAIL and BREVO_RECIPIENT_EMAIL.'
      })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const formType = payload.formType || 'contactForm';
    const emailBody = createEmailBody(formType, payload);
    const replyToEmail = formType === 'registrationForm'
      ? payload.parentEmail
      : payload.contactEmail;
    const replyTo = replyToEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyToEmail)
      ? { email: replyToEmail }
      : undefined;

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'LDT Rakousy',
          email: senderEmail
        },
        to: [{
          email: recipientEmail,
          name: 'Příjemce'
        }],
        subject: emailBody.subject,
        htmlContent: emailBody.htmlContent,
        textContent: emailBody.textContent,
        ...(replyTo ? { replyTo } : {})
      })
    });

    const responseText = await response.text();
    
    console.log('Brevo status:', response.status);
    console.log('Brevo body:', responseText);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          success: false,
          error: 'Brevo rejected the request.',
          details: responseText
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sent successfully.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};
