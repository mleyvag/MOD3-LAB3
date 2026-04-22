const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();

// Cliente de Pub/Sub — usa automáticamente las credenciales de la
// Cuenta de Servicio del contenedor (Application Default Credentials).
// IMPORTANTE: la Cuenta de Servicio debe tener el rol "roles/pubsub.publisher"
// asignado (ver Fase 6 del laboratorio).
const pubsub = new PubSub();

// Middleware para parsear cuerpos de formularios HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

/**
 * GET /
 * Sirve el formulario de checkout de ShopUTEC.
 * Genera un ID de orden aleatorio en cada carga para simular
 * una orden nueva en cada transacción.
 */
app.get('/', (req, res) => {
  // Genera un número de orden pseudo-aleatorio entre 0 y 9999
  const idOrden = `ORD-${Math.floor(Math.random() * 10000)}`;

  res.send(`
    <html>
      <body style="font-family: Arial; padding: 50px; background: #f0f2f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">🛒 ShopUTEC Checkout</h2>
          <form action="/comprar" method="POST">
            <!-- ID de orden oculto generado automáticamente por el servidor -->
            <input type="hidden" name="id_orden" value="${idOrden}">

            <label>Nombre del Cliente:</label><br>
            <input type="text" name="cliente" style="width:100%; padding:8px; margin: 8px 0;" required><br>

            <label>Correo Electrónico:</label><br>
            <input type="email" name="email" style="width:100%; padding:8px; margin: 8px 0;" required><br>

            <label>Monto a Pagar ($):</label><br>
            <input type="number" name="total" value="1500" style="width:100%; padding:8px; margin: 8px 0;"><br><br>

            <button type="submit" style="width:100%; padding:12px; background:#0056b3; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
              Confirmar Compra
            </button>
          </form>
        </div>
      </body>
    </html>
  `);
});


app.post('/comprar', async (req, res) => {
  try {
    // Serializar los datos de la orden a JSON y convertir a Buffer
    // Pub/Sub requiere que el payload del mensaje sea de tipo Buffer o Uint8Array
    const data = Buffer.from(JSON.stringify(req.body));

    // Publicar el mensaje en el tópico de Pub/Sub
    // Esta operación es no-bloqueante para el usuario: Pub/Sub entrega el mensaje
    // de forma asíncrona a todos los suscriptores activos (fan-out).
    // IMPORTANTE: el nombre del tópico debe coincidir exactamente con el creado en la Fase 6
    await pubsub.topic('ordenes-compra-[iniciales]').publishMessage({ data });

    // Responder de inmediato al usuario con pantalla de confirmación
    // En este punto, el cobro y el correo AÚN NO se han procesado,
    // pero el mensaje ya está en el bus y será procesado de forma segura.
    res.send(`
      <div style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #28a745;">✅ ¡Compra Exitosa!</h1>
        <p>Tu orden <b>${req.body.id_orden}</b> ha sido recibida y está siendo procesada.</p>
        <a href="/" style="text-decoration: none; color: #0056b3;">← Realizar otra compra</a>
      </div>
    `);
  } catch (error) {
    // Si Pub/Sub falla (ej: error de permisos IAM), devolver un error 500 descriptivo
    res.status(500).send(`Error al publicar el mensaje en Pub/Sub: ${error.message}`);
  }
});

// Iniciar el servidor HTTP en el puerto 8080
// Cloud Run inyecta la variable PORT, pero 8080 es el valor por defecto obligatorio
app.listen(8080, () => console.log('🚀 Servidor web ShopUTEC iniciado en el puerto 8080'));
