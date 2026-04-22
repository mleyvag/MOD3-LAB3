const functions = require('@google-cloud/functions-framework');

functions.cloudEvent('helloPubSub', (cloudEvent) => {
  // 1. Decodificar el payload del mensaje desde Base64 a string UTF-8
  const data = Buffer.from(cloudEvent.data.message.data, 'base64').toString();

  // 2. Parsear el string JSON para obtener el objeto de la orden
  const orden = JSON.parse(data);

  // 3. Registrar el cobro procesado en Cloud Logging (visible en la consola GCP)
  console.log(
    `[COBRO] ✅ Pago de $${orden.total} procesado con éxito ` +
    `para la orden ${orden.id_orden}. Cliente: ${orden.cliente}`
  );
});
