import * as yup from "yup";

// ─────────────────────────────────────────────
//  Contact Form
// ─────────────────────────────────────────────

export const contactSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .required("El nombre es requerido"),

  lastName: yup
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .required("El apellido es requerido"),

  email: yup
    .string()
    .trim()
    .email("Ingresa un correo válido")
    .required("El correo es requerido"),

  subject: yup
    .string()
    .trim()
    .min(4, "El asunto debe tener al menos 4 caracteres")
    .max(100, "Máximo 100 caracteres")
    .required("El asunto es requerido"),

  message: yup
    .string()
    .trim()
    .min(20, "El mensaje debe tener al menos 20 caracteres")
    .max(2000, "Máximo 2000 caracteres")
    .required("El mensaje es requerido"),
});

export type ContactFormValues = yup.InferType<typeof contactSchema>;

export const contactDefaultValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  message: "",
};

// ─────────────────────────────────────────────
//  Volunteer Form
// ─────────────────────────────────────────────

export const volunteerSchema = yup.object({
  // Personal
  firstName: yup
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .required("El nombre es requerido"),

  lastName: yup
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .required("El apellido es requerido"),

  idDocument: yup
    .string()
    .trim()
    .min(6, "Ingresa un documento válido")
    .max(20, "Máximo 20 caracteres")
    .required("La cédula o pasaporte es requerida"),

  birthDate: yup
    .string()
    .required("La fecha de nacimiento es requerida")
    .test("age", "Debes tener al menos 16 años", (value) => {
      if (!value) return false;
      const birth = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      return age > 16 || (age === 16 && m >= 0);
    }),

  address: yup.string().trim().max(150, "Máximo 150 caracteres").optional(),

  // Contact
  email: yup
    .string()
    .trim()
    .email("Ingresa un correo válido")
    .required("El correo es requerido"),

  phone: yup
    .string()
    .trim()
    .min(8, "Ingresa un teléfono válido")
    .max(20, "Máximo 20 caracteres")
    .required("El teléfono es requerido"),

  socialMedia: yup.string().trim().max(100, "Máximo 100 caracteres").optional(),

  // Professional
  occupation: yup.string().trim().max(80, "Máximo 80 caracteres").optional(),

  educationLevel: yup.string().optional(),

  skills: yup
    .string()
    .trim()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),

  // Interest areas — at least one required
  areas: yup
    .array(yup.string().required())
    .min(1, "Selecciona al menos un área de interés")
    .required("Selecciona al menos un área de interés"),

  // Availability — required
  availability: yup
    .string()
    .required("Selecciona tu disponibilidad"),

  weeklyHours: yup.string().trim().max(20, "Máximo 20 caracteres").optional(),

  // Motivation
  motivation: yup
    .string()
    .trim()
    .min(30, "Cuéntanos un poco más, mínimo 30 caracteres")
    .max(1500, "Máximo 1500 caracteres")
    .required("La motivación es requerida"),

  referral: yup.string().optional(),

  // Emergency contact
  emergencyName: yup
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres")
    .required("El nombre de contacto de emergencia es requerido"),

  emergencyRelation: yup
    .string()
    .trim()
    .max(50, "Máximo 50 caracteres")
    .required("La relación es requerida"),

  emergencyPhone: yup
    .string()
    .trim()
    .min(8, "Ingresa un teléfono válido")
    .max(20, "Máximo 20 caracteres")
    .required("El teléfono de emergencia es requerido"),

  // Terms
  acceptTerms: yup
    .boolean()
    .oneOf([true], "Debes aceptar los términos y condiciones")
    .required("Debes aceptar los términos y condiciones"),
});

export type VolunteerFormValues = yup.InferType<typeof volunteerSchema>;

export const volunteerDefaultValues: VolunteerFormValues = {
  firstName:        "",
  lastName:         "",
  idDocument:       "",
  birthDate:        "",
  address:          "",
  email:            "",
  phone:            "",
  socialMedia:      "",
  occupation:       "",
  educationLevel:   "",
  skills:           "",
  areas:            [],
  availability:     "",
  weeklyHours:      "",
  motivation:       "",
  referral:         "",
  emergencyName:    "",
  emergencyRelation:"",
  emergencyPhone:   "",
  acceptTerms:      false,
};
