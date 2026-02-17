# Al Tiro - Plataforma de Apuestas P2P

Plataforma de apuestas deportivas peer-to-peer con sistema de retos directos y liquidación administrativa.

## 🚀 Características

- **Apuestas P2P**: Sistema de apuestas directas entre usuarios
- **Retos Directos**: Desafía a otros usuarios con tu código único
- **Panel de Admin**: Interfaz para resolver apuestas manualmente
- **Balance en Tiempo Real**: Sincronización automática con la base de datos
- **Historial Completo**: Visualiza tus apuestas ganadas y perdidas
- **Sistema de Wallet**: Gestión de balance con transacciones registradas

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL (recomendado: [Neon](https://neon.tech) para desarrollo)
- npm o pnpm

## 🛠️ Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd altiro
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configura las variables de entorno**
   
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` y configura tu `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   ```

4. **Configura la base de datos**
   
   Ejecuta las migraciones de Prisma:
   ```bash
   npx prisma migrate dev
   ```
   
   (Opcional) Abre Prisma Studio para ver la base de datos:
   ```bash
   npx prisma studio
   ```

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
altiro/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── admin/        # Endpoints de administración
│   │   ├── auth/         # Autenticación
│   │   ├── bets/         # Gestión de apuestas
│   │   ├── challenge/    # Retos directos
│   │   └── wallet/       # Balance de usuarios
│   ├── admin/            # Panel administrativo
│   ├── auth/             # Páginas de autenticación
│   └── dashboard/        # Dashboard de usuario
├── components/            # Componentes React
│   ├── dashboard/        # Componentes del dashboard
│   ├── landing/          # Componentes de landing page
│   └── ui/               # Componentes UI reutilizables
├── lib/                   # Utilidades y contextos
│   ├── auth-context.tsx  # Contexto de autenticación
│   ├── bets-context.tsx  # Contexto de apuestas
│   └── prisma.ts         # Cliente de Prisma
├── prisma/               # Esquema y migraciones de base de datos
└── public/               # Archivos estáticos
```

## 🎮 Uso

### Para Usuarios

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Ver Partidos**: Explora los eventos deportivos disponibles
3. **Crear Apuesta**: 
   - Selecciona un partido
   - Elige tu predicción
   - Define el monto
   - Crea un reto directo con el código de otro usuario
4. **Aceptar Retos**: Revisa y acepta retos en la sección de desafíos
5. **Ver Historial**: Consulta tus apuestas activas y resueltas en "Mis Apuestas"

### Para Administradores

1. Navega a `/admin/matches`
2. Verás todas las apuestas activas
3. Haz clic en "Winner" junto al participante ganador
4. El sistema automáticamente:
   - Actualiza el estado del match
   - Transfiere las ganancias (95% del pool)
   - Registra el fee de plataforma (5%)
   - Actualiza el historial de ambos usuarios

## 🔧 Tecnologías

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Firebase Auth (opcional)
- **UI Components**: shadcn/ui

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso personal.

## 🐛 Problemas Conocidos

Si encuentras algún problema, por favor abre un issue en GitHub.

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
