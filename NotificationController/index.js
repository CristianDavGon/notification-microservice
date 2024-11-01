require("dotenv").config();
const express = require("express");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

const app = express();
const PORT = 3000;

// Key de la API SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Datos de autenticación de Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Para que recibamos los datos en formato JSON
app.use(express.json());

app.post("/purchase-notification", async (req, res) => {
  const { email, phone } = req.body;

  // Comprobamos que se han recibido los datos necesarios, por ahora solo email y phone
  if (!email || !phone) {
    return res.status(400).json({
      error: "Faltan parámetros de email o  teléfono",
    });
  }

  const mensajeFijoSMS = `Estimado cliente,
¡Gracias por elegir Estilo Urbano! Apreciamos sinceramente tu compra y la confianza que has depositado en nosotros. Estamos comprometidos a ofrecerte productos de alta calidad y un servicio excepcional.
Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos. Esperamos verte de nuevo pronto.
¡Que tengas un excelente día!
Atentamente,
El equipo de Estilo Urbano`;

  const subject = "Gracias por tu compra en Estilo Urbano";

  try {
    // Enviar el correo electrónico usando una plantilla
    await sgMail.send({
      to: email,
      from: "estilourbano.contactoservice@gmail.com",
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      dynamic_template_data: {
        subject: subject,
      },
    });
    console.log("Correo enviado con éxito");
    // Se envia el sms
    await twilioClient.messages.create({
      body: mensajeFijoSMS,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log("SMS enviado con éxito");

    // Respuesta exitosa
    res.status(200).json({ success: "Correo y SMS enviados con éxito" });
  } catch (error) {
    console.error("Error enviando el correo o SMS:", error);
    res.status(500).json({ error: "Error al enviar el correo o SMS" });
  }
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
