const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

/**
 * Envoie un email d'alerte lorsqu'un appareil passe en statut "Non valide"
 * @param {Object} data - Les données de l'appareil
 * @param {string} data.name - Nom/identifiant de l'appareil
 * @param {string} data.type - Type d'appareil
 * @param {string} data.section - Section (Élingues, Manilles, etc.)
 * @param {string} data.previousStatus - Statut précédent (optionnel)
 * @param {string} data.notes - Notes associées (optionnel)
 */
const sendNonValideAlert = async (data) => {
    const { name, type, section, previousStatus, notes } = data;

    const transporter = createTransporter();

    const emailContent = {
        from: process.env.EMAIL_FROM || 'Suivi VGP <noreply@example.com>',
        to: process.env.EMAIL_TO_ALERT,
        subject: `⚠️ Alerte VGP - ${name} passé en NON VALIDE`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">⚠️ Alerte Statut VGP</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
                    <h2 style="color: #DC2626; margin-top: 0;">Un appareil de levage est passé en statut "Non Valide"</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 40%;">Identifiant / Nom</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Type</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${type || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Section</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${section || 'N/A'}</td>
                        </tr>
                        ${previousStatus ? `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Statut précédent</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${previousStatus}</td>
                        </tr>
                        ` : ''}
                        ${notes ? `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Notes</td>
                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${notes}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td style="padding: 10px; font-weight: bold;">Date de détection</td>
                            <td style="padding: 10px;">${new Date().toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 4px;">
                        <strong>Action requise :</strong> Veuillez vérifier cet équipement et prendre les mesures nécessaires.
                    </div>
                </div>
                
                <div style="padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>Cet email a été envoyé automatiquement par Suivi VGP.</p>
                    <p>Ne pas répondre à cet email.</p>
                </div>
            </div>
        `,
        text: `
ALERTE VGP - ${name} passé en NON VALIDE

Un appareil de levage est passé en statut "Non Valide".

Identifiant / Nom: ${name || 'N/A'}
Type: ${type || 'N/A'}
Section: ${section || 'N/A'}
${previousStatus ? `Statut précédent: ${previousStatus}` : ''}
${notes ? `Notes: ${notes}` : ''}
Date de détection: ${new Date().toLocaleString('fr-FR')}

Action requise : Veuillez vérifier cet équipement et prendre les mesures nécessaires.

---
Cet email a été envoyé automatiquement par Suivi VGP.
        `
    };

    try {
        const info = await transporter.sendMail(emailContent);
        console.log(`✅ Email d'alerte envoyé pour ${name}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Erreur envoi email pour ${name}:`, error.message);
        throw error;
    }
};

/**
 * Vérifie si le statut est "Non valide" (insensible à la casse)
 * @param {string|Object} status - Le statut à vérifier
 * @returns {boolean}
 */
const isNonValideStatus = (status) => {
    if (!status) return false;
    const statusText = typeof status === 'object' ? status.value : status;
    return statusText?.toLowerCase().trim() === 'non valide';
};

module.exports = {
    sendNonValideAlert,
    isNonValideStatus
};
