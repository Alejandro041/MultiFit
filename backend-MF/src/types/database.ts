export interface AsignacionRutina {
  id: string;
  rutina_id: string | null;
  miembro_id: string | null;
  assigned_by: string | null;
  start_date: string;
  end_date: string | null;
  status: string | null;
  created_at: string | null;
}

export interface Clase {
  id: string;
  gym_id: string | null;
  trainer_id: string | null;
  name: string;
  description: string | null;
  schedule: string;
  duration_minutes: number | null;
  max_capacity: number | null;
  current_enrollment: number | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DetallePago {
  id: string;
  pago_id: string;
  concept: string;
  amount: string;
  tax_amount: string | null;
  discount_amount: string | null;
  description: string | null;
  created_at: string | null;
}

export interface Gym {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  capacity: number | null;
  status: string | null;
  opening_time: string | null;
  closing_time: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InscripcionClase {
  id: string;
  clase_id: string | null;
  miembro_id: string | null;
  enrollment_date: string | null;
  attendance_status: string | null;
}

export interface Miembro {
  id: string;
  persona_id: string;
  current_membership_id: string | null;
  height: string | null;
  weight: string | null;
  fitness_level: string | null;
  personal_goals: string | null;
  join_date: string | null;
  membership_status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Pago {
  id: string;
  miembro_id: string;
  membership_type_id: string | null;
  payment_date: string | null;
  due_date: string;
  amount: string;
  status: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface Persona {
  id: string;
  gym_id: string | null;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  health_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Rol {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, unknown> | unknown[];
  created_at: string | null;
}

export interface Rutina {
  id: string;
  gym_id: string | null;
  trainer_id: string | null;
  name: string;
  description: string | null;
  difficulty: string | null;
  estimated_duration: number | null;
  exercises: Record<string, unknown> | unknown[];
  is_active: boolean | null;
  created_at: string | null;
}

export interface TipoMembresia {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  price: string;
  duration_days: number;
  features: Record<string, unknown>;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Usuario {
  id: string;
  persona_id: string | null;
  username: string | null;
  email: string | null;
  is_active: boolean | null;
  last_login: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UsuarioOrganization {
  user_id: string;
  organization_id: string;
  rol_id: string;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      asignacion_rutina: {
        Row: AsignacionRutina;
        Insert: Partial<Omit<AsignacionRutina, "id" | "created_at">> & {
          start_date: string;
        };
        Update: Partial<AsignacionRutina>;
      };
      clase: {
        Row: Clase;
        Insert: Partial<Omit<Clase, "id" | "created_at" | "updated_at">> & {
          name: string;
          schedule: string;
        };
        Update: Partial<Clase>;
      };
      detalle_pago: {
        Row: DetallePago;
        Insert: Partial<Omit<DetallePago, "id" | "created_at">> & {
          pago_id: string;
          concept: string;
          amount: string;
        };
        Update: Partial<DetallePago>;
      };
      gyms: {
        Row: Gym;
        Insert: Partial<Omit<Gym, "id" | "created_at" | "updated_at">> & {
          organization_id: string;
          name: string;
          code: string;
        };
        Update: Partial<Gym>;
      };
      inscripcion_clase: {
        Row: InscripcionClase;
        Insert: Partial<Omit<InscripcionClase, "id" | "enrollment_date">>;
        Update: Partial<InscripcionClase>;
      };
      miembro: {
        Row: Miembro;
        Insert: Partial<Omit<Miembro, "id" | "created_at" | "updated_at" | "join_date">> & {
          persona_id: string;
        };
        Update: Partial<Miembro>;
      };
      organizations: {
        Row: Organization;
        Insert: Partial<Omit<Organization, "id" | "created_at" | "updated_at">> & {
          name: string;
        };
        Update: Partial<Organization>;
      };
      pago: {
        Row: Pago;
        Insert: Partial<Omit<Pago, "id" | "created_at" | "payment_date">> & {
          miembro_id: string;
          due_date: string;
          amount: string;
        };
        Update: Partial<Pago>;
      };
      persona: {
        Row: Persona;
        Insert: Partial<Omit<Persona, "id" | "created_at" | "updated_at">> & {
          document_number: string;
          first_name: string;
          last_name: string;
        };
        Update: Partial<Persona>;
      };
      rol: {
        Row: Rol;
        Insert: Partial<Omit<Rol, "id" | "created_at">> & {
          name: string;
        };
        Update: Partial<Rol>;
      };
      rutina: {
        Row: Rutina;
        Insert: Partial<Omit<Rutina, "id" | "created_at">> & {
          name: string;
        };
        Update: Partial<Rutina>;
      };
      tipo_membresia: {
        Row: TipoMembresia;
        Insert: Partial<Omit<TipoMembresia, "id" | "created_at">> & {
          gym_id: string;
          name: string;
          price: string;
          duration_days: number;
        };
        Update: Partial<TipoMembresia>;
      };
      usuario: {
        Row: Usuario;
        Insert: Usuario;
        Update: Partial<Usuario>;
      };
      usuario_organization: {
        Row: UsuarioOrganization;
        Insert: UsuarioOrganization;
        Update: Partial<UsuarioOrganization>;
      };
    };
  };
}
