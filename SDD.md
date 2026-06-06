# Documento de Diseño de Software (SDD)

## Plataforma de Menú Semanal - Nutriarte

### 1. Introducción

**1.1 Propósito**
Este documento define la arquitectura, diseño de base de datos y componentes funcionales del MVP (Producto Mínimo Viable) para la aplicación web de "Menú Semanal" de Nutriarte.

**1.2 Alcance del MVP**
La plataforma permitirá a los usuarios suscribirse mensualmente para acceder a menús semanales saludables (con opciones omnívoras y vegetarianas), listas de compras interactivas y tips nutricionales. Incluirá un panel de administración para que el equipo de Nutriarte gestione el contenido y supervise las suscripciones.

**1.3 Filosofía de Diseño (UI/UX)**

* **Estilo:** Minimalista, "Clean UI", profesionalismo nutricional. Mucho espacio en blanco, tipografías sans-serif legibles y colores tierra/pastel alineados al branding de Nutriarte.

* **Enfoque:** *Mobile-first* (diseñado primariamente para uso en teléfonos móviles desde la cocina o el supermercado).

### 2. Arquitectura General

El sistema utilizará una arquitectura *Serverless* para garantizar escalabilidad, bajos costos de mantenimiento y alta disponibilidad durante los picos de tráfico (ej. viernes cuando se publica el nuevo menú).

* **Frontend (App Usuario y Admin):** React.js + Tailwind CSS.

* **Backend (Lógica de negocio y Pagos):** Firebase Cloud Functions (Node.js).

* **Base de Datos:** Firebase Firestore (NoSQL en tiempo real).

* **Autenticación:** Firebase Authentication (Email/Contraseña y Google).

* **Pasarelas de Pago:** Mercado Pago (Argentina/Latam) y PayPal (Internacional).

### 3. Modelo de Suscripción (Arquitectura Robusta)

Para que el sistema de pagos sea infalible, la "fuente de la verdad" sobre si un usuario tiene acceso o no, **nunca** residirá en el frontend. Se basará en un sistema asíncrono mediante *Webhooks*.

**3.1 Flujo de Pago Seguro**

1. El usuario elige el plan (MP o PayPal) en la App.

2. La App llama a una *Cloud Function* segura que genera un "Link de Preferencia de Pago".

3. El usuario paga en el entorno seguro de Mercado Pago/PayPal.

4. **Webhooks (El corazón del sistema):** Al aprobarse el pago, la pasarela envía una notificación (Webhook) en segundo plano a nuestro backend (*Cloud Function* `handlePaymentWebhook`).

5. El backend verifica la firma criptográfica del Webhook (para evitar fraudes) y actualiza el campo `subscription_status` a `active` en la base de datos del usuario.

6. La app (conectada a Firestore en tiempo real) detecta el cambio y desbloquea el contenido instantáneamente.

**3.2 Estados de Suscripción (`subscription_status`)**

* `inactive`: Estado por defecto. Sin acceso.

* `active`: Pago al día. Acceso total.

* `past_due`: Pago mensual fallido (tarjeta rechazada). Se da un período de gracia de 3 días antes de cortar el acceso.

* `canceled`: Suscripción cancelada por el usuario (mantiene acceso hasta fin de mes).

### 4. Diseño de Base de Datos (Firestore)

**Colección: `users`**
Almacena la información del usuario y su estado de acceso.

* `uid` (String, PK)
* `email` (String)
* `role` (String) - ["user", "admin"]
* `subscription_status` (String) - ["active", "inactive", "past_due"]
* `subscription_end_date` (Timestamp)
* `payment_provider` (String) - ["mercadopago", "paypal", null]

**Colección: `menus`**
Almacena el contenido semanal.

* `week_id` (String, Ej: "2026-W24")
* `status` (String) - ["draft", "published", "archived"]
* `release_date` (Timestamp) - Fecha en que se hace visible (Viernes).
* `days` (Array de Objetos) - [Lunes a Viernes con título, ingredientes, paso a paso, y alternativa vegetariana].
* `sections` (Objeto) - { estrella, yapa, comodin, tips_nutriarte }
* `shopping_list` (Objeto) - { omnivora: [], vegetariana: [] }

### 5. Interfaz de Usuario - MVP

#### 5.1 Pantallas del Usuario (App Web)

1. **Landing Page & Onboarding:** Propuesta de valor de Nutriarte, precios claros, botón de registro.

2. **Dashboard Principal (La Cocina):** * Visualización de "Semana Actual" y "Semana Próxima" (si es viernes/sábado/domingo).
   * Carrusel o lista vertical de los 5 días.
   * Tarjetas desplegables con: Receta principal, Reemplazo Veggie, Tips.

3. **Lista de Compras Interactiva:**
   * Selector: "Como de todo" / "Soy Vegetariano".
   * Categorías (Verdulería, Carnicería, Almacén).
   * Casillas de verificación (*checkboxes*) que guardan el estado localmente para tachar mientras se compra.

4. **Mi Cuenta / Suscripción:**
   * Datos personales.
   * Estado de la suscripción (Activa/Inactiva).
   * Botón para "Gestionar Suscripción" (Cancelar o cambiar medio de pago de forma autogestionada, clave para reducir carga de soporte).

#### 5.2 Pantallas del Administrador (Admin Panel)

El Admin Panel debe ser una ruta protegida (ej. `/admin`) a la que solo acceden los usuarios con `role: "admin"`.

1. **Dashboard de Métricas:**
   * Total de suscriptores activos.
   * Ingresos recurrentes mensuales (MRR).
   * Tasa de cancelación (Churn).

2. **Gestor de Menús (CMS):**
   * Tabla con menús (Borradores, Programados, Pasados).
   * **Editor de Menú:** Un formulario intuitivo para crear una semana. Campos para cada día, sección para cargar imágenes de los platos, y generador de lista de compras.
   * Botón "Programar Publicación": Permite dejar el menú armado el martes y que el sistema lo habilite solo el viernes a las 10:00 AM.

3. **Gestor de Usuarios:**
   * Buscador por email.
   * Ver estado de pago de un usuario específico.
   * Botón de "Otorgar acceso manual" (para cortesías o resolución de problemas).

### 6. Consideraciones de Seguridad

* **Reglas de Firestore:** Solo los usuarios con `subscription_status: active` podrán leer la colección de `menus`. Esto impide que alguien inspeccione el código fuente de la web y robe las recetas sin pagar.

* **Protección de Rutas:** El panel de administración debe estar protegido tanto en el frontend (React Router) como en el backend (verificando el Custom Claim de Firebase Auth en cada petición).

* **Manejo de Errores de Pago:** Si Mercado Pago se cae temporalmente, el Webhook debe tener lógica de *retry* (reintentos exponenciales) para no perder el aviso de que un usuario pagó.