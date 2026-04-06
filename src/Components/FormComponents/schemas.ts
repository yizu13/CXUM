import * as yup from "yup";

// ─────────────────────────────────────────────
//  Contact Form
// ─────────────────────────────────────────────

export const contactSchema = yup.object({
  firstName: yup.string().trim().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres").required("El nombre es requerido"),
  lastName:  yup.string().trim().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres").required("El apellido es requerido"),
  email:     yup.string().trim().email("Correo inválido").required("El correo es requerido"),
  subject:   yup.string().trim().min(4, "Mínimo 4 caracteres").max(100, "Máximo 100 caracteres").required("El asunto es requerido"),
  message:   yup.string().trim().min(20, "Mínimo 20 caracteres").max(2000, "Máximo 2000 caracteres").required("El mensaje es requerido"),
});

export type ContactFormValues = yup.InferType<typeof contactSchema>;
export const contactDefaultValues: ContactFormValues = { firstName: "", lastName: "", email: "", subject: "", message: "" };

// ─────────────────────────────────────────────
//  Volunteer Form
// ─────────────────────────────────────────────

export const volunteerSchema = yup.object({
  firstName:         yup.string().trim().min(2, "Mínimo 2 caracteres").max(50).required("El nombre es requerido"),
  lastName:          yup.string().trim().min(2, "Mínimo 2 caracteres").max(50).required("El apellido es requerido"),
  idDocument:        yup.string().trim().min(6, "Documento inválido").max(20).required("La cédula o pasaporte es requerida"),
  birthDate:         yup.string().required("La fecha de nacimiento es requerida").test("age", "Debes tener al menos 16 años", (value) => {
    if (!value) return false;
    const birth = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    return age > 16 || (age === 16 && m >= 0);
  }),
  address:           yup.string().trim().max(150).optional(),
  email:             yup.string().trim().email("Correo inválido").required("El correo es requerido"),
  phone:             yup.string().trim().min(8, "Teléfono inválido").max(20).required("El teléfono es requerido"),
  socialMedia:       yup.string().trim().max(100).optional(),
  occupation:        yup.string().trim().max(80).optional(),
  educationLevel:    yup.string().optional(),
  skills:            yup.string().trim().max(1000).optional(),
  areas:             yup.array(yup.string().required()).min(1, "Selecciona al menos un área").required(),
  availability:      yup.string().required("Selecciona tu disponibilidad"),
  weeklyHours:       yup.string().trim().max(20).optional(),
  motivation:        yup.string().trim().min(30, "Mínimo 30 caracteres").max(1500).required("La motivación es requerida"),
  referral:          yup.string().optional(),
  emergencyName:     yup.string().trim().min(2).max(100).required("El nombre de emergencia es requerido"),
  emergencyRelation: yup.string().trim().max(50).required("La relación es requerida"),
  emergencyPhone:    yup.string().trim().min(8).max(20).required("El teléfono de emergencia es requerido"),
  acceptTerms:       yup.boolean().oneOf([true], "Debes aceptar los términos").required(),
});

export type VolunteerFormValues = yup.InferType<typeof volunteerSchema>;
export const volunteerDefaultValues: VolunteerFormValues = {
  firstName: "", lastName: "", idDocument: "", birthDate: "", address: "",
  email: "", phone: "", socialMedia: "", occupation: "", educationLevel: "",
  skills: "", areas: [], availability: "", weeklyHours: "", motivation: "",
  referral: "", emergencyName: "", emergencyRelation: "", emergencyPhone: "", acceptTerms: false,
};

// ─────────────────────────────────────────────
//  Admin – Centro de Acopio Form
// ─────────────────────────────────────────────

export const centroSchema = yup.object({
  nombre:      yup.string().trim().min(3, "Mínimo 3 caracteres").max(120, "Máximo 120 caracteres").required("El nombre es requerido"),
  tipo:        yup.string().oneOf(["alimentos", "ropa", "medicamentos", "general"]).required("El tipo es requerido"),
  estado:      yup.string().oneOf(["activo", "inactivo", "lleno"]).required("El estado es requerido"),
  direccion:   yup.string().trim().min(5, "Mínimo 5 caracteres").max(200).required("La dirección es requerida"),
  municipio:   yup.string().trim().min(2).max(100).required("El municipio es requerido"),
  telefono:    yup.string().trim().min(7, "Teléfono inválido").max(25).required("El teléfono es requerido"),
  horario:     yup.string().trim().min(3).max(80).required("El horario es requerido"),
  responsable: yup.string().trim().min(2).max(100).required("El responsable es requerido"),
  capacidad:   yup.number().typeError("Debe ser un número").min(1, "Mínimo 1").max(99999).required("La capacidad es requerida"),
  ocupacion:   yup.number().typeError("Debe ser un número").min(0).required("La ocupación es requerida"),
});

export type CentroFormValues = yup.InferType<typeof centroSchema>;
export const centroDefaultValues: CentroFormValues = {
  nombre: "", tipo: "general", estado: "activo", direccion: "", municipio: "",
  telefono: "", horario: "", responsable: "", capacidad: 200, ocupacion: 0,
};

// ─────────────────────────────────────────────
//  Admin – Noticia Form
// ─────────────────────────────────────────────

export const noticiaSchema = yup.object({
  titulo:    yup.string().trim().min(5, "Mínimo 5 caracteres").max(200).required("El título es requerido"),
  categoria: yup.string().oneOf(["emergencia", "voluntariado", "donaciones", "evento", "general"]).required("La categoría es requerida"),
  estado:    yup.string().oneOf(["borrador", "publicado", "archivado"]).required("El estado es requerido"),
  autor:     yup.string().trim().min(2).max(100).required("El autor es requerido"),
  portada:   yup.string().trim().url("Debe ser una URL válida").required("La URL de portada es requerida"),
  resumen:   yup.string().trim().min(10, "Mínimo 10 caracteres").max(500).required("El resumen es requerido"),
  contenido: yup.string().trim().min(30, "Mínimo 30 caracteres").max(20000).required("El contenido es requerido"),
  tags:      yup.string().trim().max(300).optional(),
});

export type NoticiaFormValues = yup.InferType<typeof noticiaSchema>;
export const noticiaDefaultValues: NoticiaFormValues = {
  titulo: "", categoria: "general", estado: "borrador",
  autor: "", portada: "", resumen: "", contenido: "", tags: "",
};

// ─────────────────────────────────────────────
//  Admin – Voluntario Edit Form
// ─────────────────────────────────────────────

export const voluntarioEditSchema = yup.object({
  role:      yup.string().oneOf(["voluntario", "escritor", "colaborador", "administrador"]).required("El rol es requerido"),
  status:    yup.string().oneOf(["activo", "pendiente", "suspendido"]).required("El estado es requerido"),
  telefono:  yup.string().trim().min(7, "Teléfono inválido").max(25).required("El teléfono es requerido"),
  municipio: yup.string().trim().min(2).max(100).required("El municipio es requerido"),
});

export type VoluntarioEditFormValues = yup.InferType<typeof voluntarioEditSchema>;
