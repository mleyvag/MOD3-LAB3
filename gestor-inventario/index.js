const functions = require('@google-cloud/functions-framework');

functions.cloudEvent('helloPubSub', (cloudEvent) => {
  // 1. Decodificar el payload del mensaje desde Base64 a string UTF-8
  const data = Buffer.from(cloudEvent.data.message.data, 'base64').toString();

  // 2. Parsear el string JSON para obtener el objeto de la orden
  const orden = JSON.parse(data);

  // 3. Registrar la operación de inventario en Cloud Logging
  //    En producción: aquí iría la actualización del stock en Firestore/Cloud SQL
  console.log(
    `[INVENTARIO] 📦 Separando stock en almacén para la orden: ${orden.id_orden}. ` +
    `Cliente: ${orden.cliente}`
  );
});
