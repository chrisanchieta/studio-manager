import createApp from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./data/database";

const app = createApp();
const port = process.env.PORT

/* =========================
   PROCESS ERROR HANDLERS
========================= */

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */

const shutdown = async (signal: string) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  await disconnectFromDatabase();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/* =========================
   BOOTSTRAP
========================= */

async function bootstrap() {
  await connectToDatabase();

  app
    .listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    })
    .on("error", (error) => {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    });
}

bootstrap();
