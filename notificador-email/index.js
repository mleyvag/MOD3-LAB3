const functions = require('@google-cloud/functions-framework');

functions.cloudEvent('helloPubSub', (cloudEvent) => {
  // 1. Decodificar el payload del mensaje desde Base64 a string UTF-8
  const data = Buffer.from(cloudEvent.data.message.data, 'base64').toString();

  // 2. Parsear el string JSON para obtener el objeto de la orden
  const orden = JSON.parse(data);

  // 3. Simular la conexión al servidor SMTP y el envío del correo
  //    En producción: aquí iría la llamada al SDK de SendGrid / Nodemailer / etc.
  console.log(
    `[EMAIL] 📧 Conectando al servidor SMTP... ` +
    `Correo de confirmación enviado exitosamente a: ${orden.email}`
  );
});
