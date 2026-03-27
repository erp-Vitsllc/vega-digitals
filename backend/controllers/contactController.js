const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.office365.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || 'VeRP@vitsllc.com';

const RECIPIENTS = {
    contact: 'hello@vegadigital.ae',
    support: 'support@vegadigital.ae',
    enquiry: 'sales@vegadigital.ae'
};

function normalizeInquiryType(rawType) {
    const value = String(rawType || '').trim().toLowerCase();
    if (value === 'support') return 'support';
    if (value === 'contact') return 'contact';
    return 'enquiry';
}

function getTemplateByType(type) {
    if (type === 'support') {
        return {
            title: 'Support Request',
            subjectPrefix: 'Support Request'
        };
    }
    if (type === 'contact') {
        return {
            title: 'Contact Us Message',
            subjectPrefix: 'Contact Us'
        };
    }
    return {
        title: 'New Business Enquiry',
        subjectPrefix: 'New Enquiry'
    };
}

exports.sendInquiry = async (req, res) => {
    const { name, email, phone, company, designation, subject, message, inquiryType } = req.body;

    if (!SMTP_USER || !SMTP_PASS) {
        return res.status(500).json({
            success: false,
            message: 'Missing SMTP credentials. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS) in backend/.env'
        });
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    const normalizedType = normalizeInquiryType(inquiryType);
    const to = RECIPIENTS[normalizedType];
    const template = getTemplateByType(normalizedType);
    const submittedAt = new Date().toISOString();
    const safeName = name || 'N/A';
    const safeEmail = email || 'N/A';
    const safePhone = phone || 'N/A';
    const safeCompany = company || 'N/A';
    const safeDesignation = designation || 'N/A';
    const safeSubject = subject || 'N/A';
    const safeMessage = message || 'N/A';

    const mailOptions = {
        from: `"VITS Website" <${MAIL_FROM}>`,
        to,
        replyTo: email,
        subject: `${template.subjectPrefix} | ${safeCompany} | ${safeName}`,
        text: `
VITS WEBSITE - ${template.title.toUpperCase()}
--------------------------------------------------
Submitted At : ${submittedAt}
Inquiry Type : ${normalizedType}
Name         : ${safeName}
Email        : ${safeEmail}
Phone        : ${safePhone}
Company      : ${safeCompany}
Designation  : ${safeDesignation}
Subject      : ${safeSubject}
--------------------------------------------------
Message:
${safeMessage}
--------------------------------------------------
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: `${template.title} sent successfully`,
            routedTo: to
        });
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            success: false,
            message: 'SMTP authentication failed. Verify SMTP_USER/SMTP_PASS (Outlook app password if MFA is enabled).'
        });
    }
};
