import { Router } from "express";
import { authenticate } from "./middlewares/auth-middleware";
import * as authController from "./controllers/auth-controller";
import * as employeeController from "./controllers/employee-controller";
import * as clientController from "./controllers/client-controller";
import * as appointmentController from "./controllers/appointment-controller";

const router = Router();

/* =========================
   AUTH (publico)
========================= */
router.post("/auth/login", authController.login);

/* =========================
   ROTAS PROTEGIDAS 
   Todas as rotas abaixo requerem um token JWT válido
========================= */
router.use(authenticate);

/* =========================
   FUNCIONÁRIOS
========================= */
router.get("/employees", employeeController.getAllEmployees);
router.post("/employees", employeeController.createEmployee);
router.get("/employees/:id", employeeController.getEmployeeById);
router.get("/employees/:id/earnings", employeeController.getEmployeeEarnings);
router.get("/employees/:id/earnings/date", employeeController.getEmployeeEarningsByDate);
router.get("/employees/:id/appointments", appointmentController.getAppointmentsByEmployee);
router.delete("/employees/:id", employeeController.deleteEmployee);

/* =========================
   CLIENTES
========================= */
router.get("/clients", clientController.getAllClients);
router.get("/clients/search", clientController.searchClients);
router.post("/clients", clientController.createClient);
router.get("/clients/:id", clientController.getClientById);
router.get("/clients/:clientId/appointments", appointmentController.getAppointmentsByClient);
router.delete("/clients/:id", clientController.deleteClient);

/* =========================
   ATENDIMENTOS
========================= */
router.get("/appointments", appointmentController.getAllAppointments);
router.post("/appointments", appointmentController.createAppointment);
router.get("/appointments/:id", appointmentController.getAppointmentById);
router.delete("/appointments/:id", appointmentController.deleteAppointment);

export default router;
