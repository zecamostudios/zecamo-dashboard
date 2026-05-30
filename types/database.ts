export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          rol: "owner" | "admin" | "member";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          rol?: "owner" | "admin" | "member";
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          nombre?: string | null;
          rol?: "owner" | "admin" | "member";
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      prospectos: {
        Row: {
          id: string;
          negocio: string;
          nombre_dueno: string | null;
          nombre_portero: string | null;
          telefono: string | null;
          email: string | null;
          fuente: string | null;
          fecha_contacto: string | null;
          volver_a_llamar: string | null;
          estado: string;
          notas: string | null;
          notas_llamadas: string | null;
          ultimo_resultado: string | null;
          asignado_a: string | null;
          // Dashboard extensions
          linea_servicio: string | null;
          valor_estimado: number;
          etapa: string;
          asignado_initials: string | null;
          last_activity: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          negocio: string;
          nombre_dueno?: string | null;
          nombre_portero?: string | null;
          telefono?: string | null;
          email?: string | null;
          fuente?: string | null;
          fecha_contacto?: string | null;
          volver_a_llamar?: string | null;
          estado?: string;
          notas?: string | null;
          notas_llamadas?: string | null;
          ultimo_resultado?: string | null;
          asignado_a?: string | null;
          linea_servicio?: string | null;
          valor_estimado?: number;
          etapa?: string;
          asignado_initials?: string | null;
          last_activity?: string | null;
        };
        Update: {
          negocio?: string;
          nombre_dueno?: string | null;
          nombre_portero?: string | null;
          telefono?: string | null;
          email?: string | null;
          fuente?: string | null;
          fecha_contacto?: string | null;
          volver_a_llamar?: string | null;
          estado?: string;
          notas?: string | null;
          notas_llamadas?: string | null;
          ultimo_resultado?: string | null;
          asignado_a?: string | null;
          linea_servicio?: string | null;
          valor_estimado?: number;
          etapa?: string;
          asignado_initials?: string | null;
          last_activity?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      interacciones_prospecto: {
        Row: {
          id: string;
          prospecto_id: string;
          tipo: string;
          contenido: string;
          fecha: string;
          creado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospecto_id: string;
          tipo: string;
          contenido: string;
          fecha?: string;
          creado_por?: string | null;
        };
        Update: {
          tipo?: string;
          contenido?: string;
          fecha?: string;
        };
        Relationships: [];
      };
      clientes: {
        Row: {
          id: string;
          nombre: string;
          contacto_nombre: string | null;
          contacto_email: string | null;
          contacto_tel: string | null;
          fecha_inicio: string | null;
          mrr_usd: number;
          estado: string;
          notas: string | null;
          descripcion_negocio: string | null;
          problema_principal: string | null;
          solucion_implementada: string | null;
          // Dashboard extensions
          linea_servicio: string | null;
          asignado_initials: string | null;
          health_score: number;
          next_action: string | null;
          ui_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          contacto_nombre?: string | null;
          contacto_email?: string | null;
          contacto_tel?: string | null;
          fecha_inicio?: string | null;
          mrr_usd?: number;
          estado?: string;
          notas?: string | null;
          descripcion_negocio?: string | null;
          problema_principal?: string | null;
          solucion_implementada?: string | null;
          linea_servicio?: string | null;
          asignado_initials?: string | null;
          health_score?: number;
          next_action?: string | null;
          ui_status?: string;
        };
        Update: {
          nombre?: string;
          contacto_nombre?: string | null;
          contacto_email?: string | null;
          contacto_tel?: string | null;
          fecha_inicio?: string | null;
          mrr_usd?: number;
          estado?: string;
          notas?: string | null;
          descripcion_negocio?: string | null;
          problema_principal?: string | null;
          solucion_implementada?: string | null;
          linea_servicio?: string | null;
          asignado_initials?: string | null;
          health_score?: number;
          next_action?: string | null;
          ui_status?: string;
        };
        Relationships: [];
      };
      proyectos: {
        Row: {
          id: string;
          cliente_id: string;
          nombre: string;
          descripcion: string | null;
          estado: string;
          fecha_inicio: string | null;
          fecha_entrega: string | null;
          precio_total_usd: number | null;
          horas_estimadas: number | null;
          horas_reales: number;
          // Dashboard extensions
          linea_servicio: string | null;
          asignado_initials: string;
          equipo: string[];
          progreso: number;
          prioridad: string;
          ui_estado: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id?: string | null;
          nombre: string;
          descripcion?: string | null;
          estado?: string;
          fecha_inicio?: string | null;
          fecha_entrega?: string | null;
          precio_total_usd?: number | null;
          horas_estimadas?: number | null;
          horas_reales?: number;
          linea_servicio?: string | null;
          asignado_initials?: string;
          equipo?: string[];
          progreso?: number;
          prioridad?: string;
          ui_estado?: string;
        };
        Update: {
          cliente_id?: string;
          nombre?: string;
          descripcion?: string | null;
          estado?: string;
          fecha_inicio?: string | null;
          fecha_entrega?: string | null;
          precio_total_usd?: number | null;
          horas_estimadas?: number | null;
          horas_reales?: number;
          progreso?: number;
          ui_estado?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tareas: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string | null;
          asignado_a: string | null;
          prioridad: string;
          estado: string;
          fecha_limite: string | null;
          proyecto_id: string | null;
          cliente_id: string | null;
          // Dashboard extensions
          asignado_initials: string | null;
          proyecto_nombre: string | null;
          etiquetas: string[];
          creado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descripcion?: string | null;
          asignado_a?: string | null;
          prioridad?: string;
          estado?: string;
          fecha_limite?: string | null;
          proyecto_id?: string | null;
          cliente_id?: string | null;
          asignado_initials?: string | null;
          proyecto_nombre?: string | null;
          etiquetas?: string[];
          creado_por?: string | null;
        };
        Update: {
          titulo?: string;
          descripcion?: string | null;
          asignado_a?: string | null;
          prioridad?: string;
          estado?: string;
          fecha_limite?: string | null;
          proyecto_id?: string | null;
          asignado_initials?: string | null;
          proyecto_nombre?: string | null;
          etiquetas?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      transacciones: {
        Row: {
          id: string;
          fecha: string;
          tipo: "ingreso" | "egreso";
          categoria: string | null;
          descripcion: string | null;
          monto_usd: number;
          cliente_id: string | null;
          proyecto_id: string | null;
          metodo_pago: string | null;
          // Dashboard extensions
          linea_servicio: string | null;
          owner_initials: string | null;
          concepto: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fecha: string;
          tipo: "ingreso" | "egreso";
          categoria?: string | null;
          descripcion?: string | null;
          monto_usd: number;
          cliente_id?: string | null;
          proyecto_id?: string | null;
          metodo_pago?: string | null;
          linea_servicio?: string | null;
          owner_initials?: string | null;
          concepto?: string | null;
        };
        Update: {
          fecha?: string;
          tipo?: "ingreso" | "egreso";
          monto_usd?: number;
          categoria?: string | null;
          descripcion?: string | null;
          cliente_id?: string | null;
          metodo_pago?: string | null;
          concepto?: string | null;
          linea_servicio?: string | null;
          owner_initials?: string | null;
        };
        Relationships: [];
      };
      reuniones: {
        Row: {
          id: string;
          dia: string;
          hora: string;
          titulo: string;
          persona: string | null;
          owner_initials: string;
          canal: string | null;
          fecha: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dia: string;
          hora: string;
          titulo: string;
          persona?: string | null;
          owner_initials?: string;
          canal?: string | null;
          fecha?: string | null;
        };
        Update: {
          dia?: string;
          hora?: string;
          titulo?: string;
          persona?: string | null;
          owner_initials?: string;
          canal?: string | null;
        };
        Relationships: [];
      };
      outbound_mensajes: {
        Row: {
          id: string;
          para_nombre: string;
          para_empresa: string;
          owner_initials: string;
          canal: string;
          estado: string;
          enviado_hace: string | null;
          template_nombre: string | null;
          prospecto_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          para_nombre: string;
          para_empresa: string;
          owner_initials?: string;
          canal?: string;
          estado?: string;
          enviado_hace?: string | null;
          template_nombre?: string | null;
          prospecto_id?: string | null;
        };
        Update: {
          estado?: string;
          enviado_hace?: string | null;
          template_nombre?: string | null;
        };
        Relationships: [];
      };
      outbound_templates: {
        Row: {
          id: string;
          nombre: string;
          uses: number;
          reply_rate: number;
          linea_servicio: string | null;
          owner_initials: string | null;
          contenido: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          uses?: number;
          reply_rate?: number;
          linea_servicio?: string | null;
          owner_initials?: string | null;
          contenido?: string | null;
        };
        Update: {
          nombre?: string;
          uses?: number;
          reply_rate?: number;
          linea_servicio?: string | null;
          owner_initials?: string | null;
          contenido?: string | null;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          icon_name: string;
          owner_initials: string;
          texto: string;
          cuando: string;
          tipo: string | null;
          ref_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          icon_name?: string;
          owner_initials: string;
          texto: string;
          cuando: string;
          tipo?: string | null;
          ref_id?: string | null;
        };
        Update: {
          texto?: string;
          cuando?: string;
        };
        Relationships: [];
      };
      pricing_calculos: {
        Row: {
          id: string;
          nombre_solucion: string;
          area: string | null;
          descripcion: string | null;
          cliente_id: string | null;
          prospecto_id: string | null;
          // Inputs
          impacto: number | null;
          esfuerzo: number | null;
          horas_semana_tarea: number | null;
          personas_afectadas: number | null;
          pct_tiempo_ahorrado: number | null;
          sueldo_mensual_empleado_usd: number | null;
          horas_semana_empleado: number | null;
          time_to_value_semanas: number | null;
          riesgo: number | null;
          compliance_flag: boolean | null;
          fit_estrategico: number | null;
          horas_desarrollo: number | null;
          tarifa_hora_usd: number | null;
          costo_herramientas_mes_usd: number | null;
          costos_fijos_usd: number | null;
          // Computed outputs
          costo_hora_empleado_usd: number | null;
          ahorro_anual_usd: number | null;
          costo_impl_usd: number | null;
          valor_anual_cliente_usd: number | null;
          roi_pct: number | null;
          roi_score: number | null;
          esfuerzo_ajustado: number | null;
          score_final: number | null;
          clasificacion: string | null;
          precio_minimo_usd: number | null;
          precio_recomendado_usd: number | null;
          precio_agresivo_usd: number | null;
          ganancia_neta_usd: number | null;
          margen_pct: number | null;
          meses_payback_cliente: number | null;
          mensual_min_usd: number | null;
          mensual_ideal_usd: number | null;
          alerta_margen: string | null;
          alerta_pricing: string | null;
          created_at: string;
          updated_at: string;
          creado_por: string | null;
        };
        Insert: {
          id?: string;
          nombre_solucion: string;
          area?: string | null;
          descripcion?: string | null;
          cliente_id?: string | null;
          prospecto_id?: string | null;
          impacto?: number | null;
          esfuerzo?: number | null;
          horas_semana_tarea?: number | null;
          personas_afectadas?: number | null;
          pct_tiempo_ahorrado?: number | null;
          sueldo_mensual_empleado_usd?: number | null;
          horas_semana_empleado?: number | null;
          time_to_value_semanas?: number | null;
          riesgo?: number | null;
          compliance_flag?: boolean | null;
          fit_estrategico?: number | null;
          horas_desarrollo?: number | null;
          tarifa_hora_usd?: number | null;
          costo_herramientas_mes_usd?: number | null;
          costos_fijos_usd?: number | null;
          costo_hora_empleado_usd?: number | null;
          ahorro_anual_usd?: number | null;
          costo_impl_usd?: number | null;
          valor_anual_cliente_usd?: number | null;
          roi_pct?: number | null;
          roi_score?: number | null;
          esfuerzo_ajustado?: number | null;
          score_final?: number | null;
          clasificacion?: string | null;
          precio_minimo_usd?: number | null;
          precio_recomendado_usd?: number | null;
          precio_agresivo_usd?: number | null;
          ganancia_neta_usd?: number | null;
          margen_pct?: number | null;
          meses_payback_cliente?: number | null;
          mensual_min_usd?: number | null;
          mensual_ideal_usd?: number | null;
          alerta_margen?: string | null;
          alerta_pricing?: string | null;
          creado_por?: string | null;
        };
        Update: {
          nombre_solucion?: string;
          area?: string | null;
          descripcion?: string | null;
          cliente_id?: string | null;
          prospecto_id?: string | null;
          impacto?: number | null;
          esfuerzo?: number | null;
          horas_semana_tarea?: number | null;
          personas_afectadas?: number | null;
          pct_tiempo_ahorrado?: number | null;
          sueldo_mensual_empleado_usd?: number | null;
          horas_semana_empleado?: number | null;
          time_to_value_semanas?: number | null;
          riesgo?: number | null;
          compliance_flag?: boolean | null;
          fit_estrategico?: number | null;
          horas_desarrollo?: number | null;
          tarifa_hora_usd?: number | null;
          costo_herramientas_mes_usd?: number | null;
          costos_fijos_usd?: number | null;
          costo_hora_empleado_usd?: number | null;
          ahorro_anual_usd?: number | null;
          costo_impl_usd?: number | null;
          valor_anual_cliente_usd?: number | null;
          roi_pct?: number | null;
          roi_score?: number | null;
          esfuerzo_ajustado?: number | null;
          score_final?: number | null;
          clasificacion?: string | null;
          precio_minimo_usd?: number | null;
          precio_recomendado_usd?: number | null;
          precio_agresivo_usd?: number | null;
          ganancia_neta_usd?: number | null;
          margen_pct?: number | null;
          meses_payback_cliente?: number | null;
          mensual_min_usd?: number | null;
          mensual_ideal_usd?: number | null;
          alerta_margen?: string | null;
          alerta_pricing?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      outbound_campanas: {
        Row: {
          id: string;
          nombre: string;
          canal: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          notas: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          canal?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          notas?: string | null;
        };
        Update: {
          nombre?: string;
          canal?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          notas?: string | null;
        };
        Relationships: [];
      };
      outbound_envios: {
        Row: {
          id: string;
          campana_id: string;
          prospecto_id: string | null;
          fecha: string;
          estado: string | null;
          asunto: string | null;
          contenido: string | null;
        };
        Insert: {
          id?: string;
          campana_id: string;
          prospecto_id?: string | null;
          fecha?: string;
          estado?: string | null;
          asunto?: string | null;
          contenido?: string | null;
        };
        Update: {
          estado?: string | null;
        };
        Relationships: [];
      };
      // ---- Content OS tables ----
      content_posts: {
        Row: {
          id: string;
          titulo: string;
          contenido: string | null;
          plataforma: string;
          tipo: string;
          estado: string;
          ai_score: number | null;
          ai_feedback: string | null;
          hook: string | null;
          cta: string | null;
          hashtags: string[] | null;
          media_urls: string[] | null;
          programado_para: string | null;
          publicado_en: string | null;
          creado_por: string | null;
          aprobado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          contenido?: string | null;
          plataforma?: string;
          tipo?: string;
          estado?: string;
          ai_score?: number | null;
          ai_feedback?: string | null;
          hook?: string | null;
          cta?: string | null;
          hashtags?: string[] | null;
          media_urls?: string[] | null;
          programado_para?: string | null;
          publicado_en?: string | null;
          creado_por?: string | null;
          aprobado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          titulo?: string;
          contenido?: string | null;
          plataforma?: string;
          tipo?: string;
          estado?: string;
          ai_score?: number | null;
          ai_feedback?: string | null;
          hook?: string | null;
          cta?: string | null;
          hashtags?: string[] | null;
          media_urls?: string[] | null;
          programado_para?: string | null;
          publicado_en?: string | null;
          aprobado_por?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_assets: {
        Row: {
          id: string;
          nombre: string;
          tipo: string;
          contenido: string | null;
          tags: string[] | null;
          metadata: Record<string, unknown> | null;
          url: string | null;
          uses: number;
          favorito: boolean;
          creado_por: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo: string;
          contenido?: string | null;
          tags?: string[] | null;
          metadata?: Record<string, unknown> | null;
          url?: string | null;
          uses?: number;
          favorito?: boolean;
          creado_por?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nombre?: string;
          tipo?: string;
          contenido?: string | null;
          tags?: string[] | null;
          metadata?: Record<string, unknown> | null;
          url?: string | null;
          uses?: number;
          favorito?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_planner: {
        Row: {
          id: string;
          post_id: string;
          fecha: string;
          hora: string | null;
          plataforma: string;
          estado: string;
          orden: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          fecha: string;
          hora?: string | null;
          plataforma: string;
          estado?: string;
          orden?: number;
        };
        Update: {
          fecha?: string;
          hora?: string | null;
          plataforma?: string;
          estado?: string;
          orden?: number;
        };
        Relationships: [];
      };
      content_ai_generations: {
        Row: {
          id: string;
          tipo: string;
          prompt: string;
          resultado: string | null;
          plataforma: string | null;
          modelo: string;
          tokens_in: number | null;
          tokens_out: number | null;
          post_id: string | null;
          creado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipo: string;
          prompt: string;
          resultado?: string | null;
          plataforma?: string | null;
          modelo?: string;
          tokens_in?: number | null;
          tokens_out?: number | null;
          post_id?: string | null;
          creado_por?: string | null;
        };
        Update: {
          resultado?: string | null;
          tokens_in?: number | null;
          tokens_out?: number | null;
        };
        Relationships: [];
      };
      content_automation_runs: {
        Row: {
          id: string;
          nombre: string;
          tipo: string;
          estado: string;
          payload: Record<string, unknown> | null;
          resultado: Record<string, unknown> | null;
          error_msg: string | null;
          iniciado_en: string | null;
          finalizado_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo: string;
          estado?: string;
          payload?: Record<string, unknown> | null;
          resultado?: Record<string, unknown> | null;
          error_msg?: string | null;
          iniciado_en?: string | null;
          finalizado_en?: string | null;
        };
        Update: {
          estado?: string;
          resultado?: Record<string, unknown> | null;
          error_msg?: string | null;
          finalizado_en?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      prospectos_ext: {
        Row: {
          id: string;
          negocio: string;
          nombre_dueno: string | null;
          fuente: string | null;
          etapa: string;
          linea_servicio: string | null;
          valor_estimado: number;
          asignado_initials: string | null;
          last_activity: string | null;
          fecha_contacto: string | null;
          created_at: string;
          asignado_nombre: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Prospecto = Database["public"]["Tables"]["prospectos"]["Row"];
export type InteraccionProspecto = Database["public"]["Tables"]["interacciones_prospecto"]["Row"];
export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];
export type Tarea = Database["public"]["Tables"]["tareas"]["Row"];
export type Transaccion = Database["public"]["Tables"]["transacciones"]["Row"];
export type Reunion = Database["public"]["Tables"]["reuniones"]["Row"];
export type OutboundMensaje = Database["public"]["Tables"]["outbound_mensajes"]["Row"];
export type OutboundTemplate = Database["public"]["Tables"]["outbound_templates"]["Row"];
export type ActivityLogEntry = Database["public"]["Tables"]["activity_log"]["Row"];
export type PricingCalculo = Database["public"]["Tables"]["pricing_calculos"]["Row"];
export type OutboundCampana = Database["public"]["Tables"]["outbound_campanas"]["Row"];
export type OutboundEnvio = Database["public"]["Tables"]["outbound_envios"]["Row"];
