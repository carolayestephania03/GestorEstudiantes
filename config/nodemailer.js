require('dotenv').config({});
const nodemailer = require('nodemailer');

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu dirección de correo electrónico
        pass: process.env.EMAIL_PASS  // Tu contraseña de correo electrónico
    }
});

// Función para enviar correos electrónicos
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER, // Dirección del remitente
            to: to, // Dirección del destinatario
            subject: subject, // Asunto del correo
            text: text, // Contenido en texto plano
            html: html  // Contenido en HTML (opcional)
        });

        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendEmail };
