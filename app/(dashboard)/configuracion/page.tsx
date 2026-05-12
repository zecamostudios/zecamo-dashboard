import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard, Users, Building2, FolderKanban,
  Calculator, Wallet, Megaphone, CheckSquare, BarChart3,
} from "lucide-react";

const modulos = [
  {
    icon: LayoutDashboard,
    titulo: "Dashboard (Inicio)",
    ruta: "/",
    descripcion: "Vista general del negocio con KPIs en tiempo real.",
    funciones: [
      "MRR total (ingresos recurrentes mensuales de clientes activos)",
      "Pipeline CRM: cantidad de prospectos por estado",
      "Tareas pendientes del equipo",
      "Ingresos del mes actual vs el mes anterior",
      "Gráfico de ingresos vs egresos de los últimos meses",
    ],
  },
  {
    icon: Users,
    titulo: "CRM",
    ruta: "/crm",
    descripcion: "Gestión del pipeline comercial. Seguimiento de prospectos desde el primer contacto hasta el cierre.",
    funciones: [
      "Vista kanban por estado: Iniciado → Engaged → Calendly → Agendado → Cerrado",
      "Ficha de cada prospecto: datos de contacto, fuente, asignado a, notas",
      "Timeline de interacciones (llamadas, emails, reuniones, mensajes)",
      "Asignación de prospectos a miembros del equipo",
      "Filtro por estado para ver solo prospectos de cierta etapa",
    ],
  },
  {
    icon: Building2,
    titulo: "Clientes",
    ruta: "/clientes",
    descripcion: "Base de datos de clientes activos con su facturación recurrente.",
    funciones: [
      "Lista de clientes con MRR, estado y fecha de inicio",
      "Ficha completa: datos de contacto, MRR, historial de proyectos",
      "Estados: Activo, Pausado, Churn",
      "Últimas transacciones asociadas al cliente",
      "Acceso rápido a proyectos del cliente",
    ],
  },
  {
    icon: FolderKanban,
    titulo: "Proyectos",
    ruta: "/proyectos",
    descripcion: "Seguimiento de proyectos de IA en curso y entregados.",
    funciones: [
      "Vista kanban por estado: Propuesta → En desarrollo → Entregado → En soporte → Cancelado",
      "Seguimiento de horas estimadas vs reales",
      "Precio total del proyecto y fecha de entrega",
      "Asociación con cliente",
    ],
  },
  {
    icon: Calculator,
    titulo: "Calculadora de Pricing",
    ruta: "/pricing",
    descripcion: "Herramienta para calcular el precio justo de cada solución de IA antes de presentar propuesta.",
    funciones: [
      "Cálculo de ahorro anual para el cliente (horas ahorradas × costo por hora)",
      "ROI y tiempo de payback para el cliente",
      "Score final (0-10) y clasificación: Quick Win / Big Win / Nice to have / Despreciable",
      "Precios sugeridos: mínimo, recomendado y agresivo",
      "Opción de retainer mensual (mínimo e ideal)",
      "Guardado de calculaciones para comparar entre proyectos",
    ],
  },
  {
    icon: Wallet,
    titulo: "Finanzas",
    ruta: "/finanzas",
    descripcion: "Registro de ingresos y egresos del estudio.",
    funciones: [
      "Registro de transacciones con fecha, monto, categoría y descripción",
      "Filtro por tipo: todos / ingresos / egresos",
      "Gráfico de ingresos vs egresos de los últimos 6 meses",
      "Asociación de transacciones con clientes",
      "Métodos de pago: efectivo, transferencia, crypto, etc.",
    ],
  },
  {
    icon: Megaphone,
    titulo: "Outbound",
    ruta: "/outbound",
    descripcion: "Seguimiento de campañas de prospección y envíos masivos.",
    funciones: [
      "Creación de campañas por canal (LinkedIn, email, WhatsApp, etc.)",
      "Registro de envíos individuales con estado (enviado, respondido, ignorado)",
      "Fechas de inicio y fin de campaña",
      "Conteo de envíos por campaña",
    ],
  },
  {
    icon: CheckSquare,
    titulo: "Tareas",
    ruta: "/tareas",
    descripcion: "Gestión de tareas del equipo en formato kanban.",
    funciones: [
      "Columnas: To Do → En progreso → En revisión → Hecho",
      "Prioridades: Baja, Media, Alta, Urgente",
      "Asignación a miembros del equipo",
      "Fecha límite por tarea",
      "Asociación con proyectos específicos",
      "Mover tarjetas entre columnas con un clic",
    ],
  },
  {
    icon: BarChart3,
    titulo: "Analíticas",
    ruta: "/analytics",
    descripcion: "Reportes visuales del negocio.",
    funciones: [
      "Ingresos vs egresos mensuales (últimos 12 meses)",
      "Funnel CRM: distribución de prospectos por etapa",
      "Proyectos por estado",
      "Top clientes por MRR con barra comparativa",
      "KPIs: ingresos totales, egresos, margen bruto y ticket promedio",
    ],
  },
];

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración y guía</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cómo usar el dashboard — referencia para el equipo de Zecamo Studios
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Para el equipo</p>
        <p>Este dashboard es la central de operaciones de Zecamo Studios. Usalo para registrar cada interacción comercial, proyecto, transacción y tarea. Cuanto más completo esté, más útil es la vista de analíticas y el home.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {modulos.map((m) => (
          <Card key={m.ruta}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="size-4 text-primary" />
                </div>
                {m.titulo}
                <span className="text-xs text-muted-foreground font-normal ml-auto font-mono">{m.ruta}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{m.descripcion}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {m.funciones.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles de usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-primary">Owner</p>
              <p className="text-muted-foreground mt-1">Acceso total. Puede eliminar cualquier registro, gestionar el equipo y ver todas las finanzas. El primer usuario registrado queda como owner automáticamente.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-600">Admin</p>
              <p className="text-muted-foreground mt-1">Igual que owner en operaciones. Puede editar y eliminar registros de otros miembros. Se asigna manualmente desde la base de datos.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600">Member</p>
              <p className="text-muted-foreground mt-1">Puede crear y editar sus propios registros (tareas asignadas, prospectos asignados, sus calculaciones de pricing). No puede eliminar registros de otros.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
