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
/**
 * Envoie un email d'alerte lorsqu'un appareil passe en statut "Non valide"
 * @param {Object} data - Les données de l'appareil
 */
const sendNonValideAlert = async (data) => {
    const { name, type, section, length, cmu } = data;

    const transporter = createTransporter();

    // Préparation des contenus pour le mail
    const lengthStr = length ? ` - Longueur: ${length}m` : '';
    const cmuStr = cmu ? ` - CMU: ${cmu}T` : '';

    const itemDescription = `${section} - ${name} - ${type}${lengthStr}${cmuStr}`;
    const subjectQuote = `Demande de devis ${section} - ${type}${lengthStr} - CMU ${cmu}T`;

    const bodyQuote = `Bonjour,

Pourriez-vous nous envoyer un devis pour le renouvellement d'un de nos apparaux :

- ${section} - ${type}${lengthStr} - CMU ${cmu}T

Par avance merci.

Cordialement,`;

    // Fonction pour générer le lien mailto
    const generateMailto = (toEmail) => {
        const cc = 'cyril.bonamy@katoennatie.com,romain.mace@katoennatie.com';
        return `mailto:${toEmail}?cc=${cc}&subject=${encodeURIComponent(subjectQuote)}&body=${encodeURIComponent(bodyQuote)}`;
    };

    const linkMagi = generateMailto('lehavre@magi.fr');
    const linkANCC = generateMailto('contact@ancclevage.fr');
    const linkPOL = generateMailto('c.wittier@PO-Levage.fr,contact@po-levage.fr');

    const emailContent = {
        from: process.env.EMAIL_FROM || 'Suivi VGP <noreply@example.com>',
        to: process.env.EMAIL_TO_ALERT,
        subject: `L'apparau de levage "${name}" n'est plus valide`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
                <p>Bonjour,</p>

                <p>L'apparau de levage : <strong>${itemDescription}</strong> n'est plus valide.</p>

                <p>Envoyer une demande de devis à :</p>

                <ul>
                    <li style="margin-bottom: 10px;">
                        Magi levage en cliquant <a href="${linkMagi}" style="color: #2563EB; font-weight: bold; text-decoration: none;">"ICI"</a>
                    </li>
                    <li style="margin-bottom: 10px;">
                        ANCC en cliquant <a href="${linkANCC}" style="color: #2563EB; font-weight: bold; text-decoration: none;">"ICI"</a>
                    </li>
                    <li style="margin-bottom: 10px;">
                        POL (Porte Océane Levage) en cliquant <a href="${linkPOL}" style="color: #2563EB; font-weight: bold; text-decoration: none;">"ICI"</a>
                    </li>
                </ul>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                
                <div style="color: #6b7280; font-size: 12px; text-align: center;">
                    <p>Cet email a été envoyé automatiquement par Suivi VGP.</p>
                </div>
            </div>
        `,
        text: `
Bonjour,

L'apparau de levage : "${itemDescription}" n'est plus valide.

Envoyer une demande de devis à :

- Magi levage (lehavre@magi.fr)
- ANCC (contact@ancclevage.fr)
- POL (c.wittier@PO-Levage.fr)

Sujet du devis : ${subjectQuote}

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
