import type { CSSProperties, Dispatch, JSX, SetStateAction } from "react";
import type { ConditionalRule, DonationField, DonationFieldType, DonationForm, DonationFormMode, DonationFormStatus, DonationResponse, DonationSelectDisplay, DonationSelectMode } from "../../donations/types";
import type { DonationFormStep } from "../../donations/analytics";

export type AdminOption<T extends string> = { label: string; value: T; description?: string };

export type TabKey = "builder" | "reports" | "bucket";

export const CONFIG_DESCRIPTIONS: Record<string, string> = {
  Titulo: "Es el nombre principal que vera la persona al abrir el formulario.",
  "Slug publico": "Define la parte final del enlace unico que se compartira y codificara en el QR.",
  "Fecha del evento": "Indica cuando se realizara la actividad y habilita la busqueda por fecha en el directorio publico.",
  "Icono del encabezado": "Identifica visualmente la iniciativa en el encabezado, la vista previa y el directorio publico.",
  "Limite por identificador": "Define cuantas respuestas puede registrar una misma persona usando el valor del campo identificador. Vacio significa sin limite.",
  "Mensaje final": "Se muestra despues de registrar correctamente la donacion.",
  "Llenado recurrente": "Muestra una accion despues del envio para limpiar las respuestas y comenzar nuevamente desde el primer paso.",
  "Registro por seleccion": "En una seleccion multiple crea una fila independiente por alternativa, conservando los datos comunes y un grupo de envio compartido.",
  "Repetir submenu por seleccion": "Solicita los campos del submenu una vez por cada alternativa marcada y asigna esas respuestas a su registro correspondiente.",
  Etiqueta: "Es la pregunta o nombre visible encima del control en el formulario final.",
  "Submenu / seccion": "En modo guiado crea una etapa; en modo plano agrupa y ordena el contenido.",
  Prioridad: "Un numero menor coloca el campo antes que los de prioridad mayor.",
  Placeholder: "Muestra un ejemplo dentro del control antes de que la persona escriba.",
  "Limite caracteres": "Impide que la respuesta textual exceda esta cantidad de caracteres.",
  Min: "Establece la cantidad minima aceptada para campos numericos.",
  Max: "Establece la cantidad maxima aceptada para campos numericos.",
  Ayuda: "Aparece debajo del control para orientar a la persona que responde.",
  "Valor esperado": "Es la respuesta que activara la regla de visibilidad configurada.",
};

export const FIELD_TYPES: AdminOption<DonationFieldType>[] = [
  { label: "Texto", value: "text", description: "Una respuesta corta como nombre, cedula o referencia." },
  { label: "Numero", value: "number", description: "Permite cantidades y habilita estadisticas numericas." },
  { label: "Seleccion", value: "select", description: "Muestra una lista cerrada de opciones configurables." },
  { label: "Parrafo", value: "textarea", description: "Respuesta extensa para observaciones o detalles." },
  { label: "Fecha", value: "date", description: "Abre el selector de fecha del dispositivo." },
  { label: "Correo", value: "email", description: "Valida que la respuesta tenga formato de correo." },
  { label: "Telefono", value: "phone", description: "Optimiza el teclado movil y valida longitud minima." },
  { label: "Si / No", value: "boolean", description: "Presenta dos opciones visuales mutuamente excluyentes." },
];

export const STATUS_OPTIONS: AdminOption<DonationFormStatus>[] = [
  { label: "Borrador", value: "draft", description: "Solo puede configurarse desde el panel administrativo." },
  { label: "Publicado", value: "published", description: "Aparece en el directorio publico y acepta respuestas." },
  { label: "Privado", value: "private", description: "Acepta respuestas mediante QR o enlace directo, pero no aparece en el directorio publico." },
  { label: "Oculto", value: "hidden", description: "Conserva datos y configuracion sin mostrarse al publico." },
];

export const MODE_OPTIONS: AdminOption<DonationFormMode>[] = [
  { label: "Guiado por prioridad", value: "guided", description: "Muestra un paso prioritario y luego una etapa por seccion." },
  { label: "Plano", value: "flat", description: "Muestra todos los campos visibles en una sola pantalla." },
];

export const SELECT_DISPLAY_OPTIONS: AdminOption<DonationSelectDisplay>[] = [
  { label: "Autocomplete", value: "autocomplete", description: "La persona busca escribiendo y elige desde una lista filtrada." },
  { label: "Tarjetas con navegacion", value: "cards", description: "Cada opcion se presenta como tarjeta y puede abrir un submenu." },
];

export const SELECT_MODE_OPTIONS: AdminOption<DonationSelectMode>[] = [
  { label: "Seleccion unica", value: "single", description: "La persona puede elegir solamente una alternativa." },
  { label: "Seleccion multiple", value: "multiple", description: "La persona puede marcar varias alternativas en el mismo campo." },
];

export const OPERATORS: AdminOption<ConditionalRule["operator"]>[] = [
  { label: "Igual a", value: "equals", description: "El campo aparece cuando la respuesta coincide exactamente." },
  { label: "Distinto de", value: "notEquals", description: "El campo aparece cuando la respuesta es diferente." },
  { label: "Contiene", value: "contains", description: "Busca el texto indicado dentro de la respuesta." },
  { label: "Mayor que", value: "greaterThan", description: "Compara respuestas numericas con el valor esperado." },
  { label: "Menor que", value: "lessThan", description: "Compara respuestas numericas con el valor esperado." },
];

export interface dynamicFieldObject {
        cardStyle: CSSProperties;
        inputStyle: CSSProperties;
        text: string;
        muted: string;
        selectedForm: DonationForm;
        updateForm: (updates: Partial<DonationForm>) => void;
        addField: () => void;
        removeField: (fieldId: string) => void;
        updateField: (fieldId: string, updates: Partial<DonationField>) => void;
        updateFieldSection: (fieldId: string, section: string) => void;
        sectionOptions: AdminOption<string>[];
        isDark: boolean;
}

export interface previewFormObject {
        cardStyle: CSSProperties;
        inputStyle: CSSProperties;
        text: string;
        muted: string;
        selectedForm: DonationForm;
        qrDataUrl?: string;
        previewSteps?: DonationFormStep[] | undefined;
        previewStep: number;
        previewPrimaryField?: DonationField | undefined;
        isDark: boolean;
        renderPreviewField: (field: DonationField, featured?: boolean, repeatContext?: DonationFormStep["repeatContext"]) => JSX.Element;
        setPreviewStep: (fun: (prev: number) => number) => void;
        resetPreview: () => void;
        previewFlatGroups: DonationFormStep[];
}

export interface reportsTabObject {
        renderFilters: () => JSX.Element;
        cardStyle: CSSProperties;
        text: string;
        muted: string;
        selectedResponses: DonationResponse[];
        selectedForm: DonationForm;
        target: number ;
        scatterXFieldId?: string | undefined;
        scatterYFieldId?: string | undefined;
        setScatterXFieldId: (fieldId: string) => void;
        setScatterYFieldId: (fieldId: string) => void;
        numericFields: DonationField[];
        inputStyle: CSSProperties;
        isDark: boolean;
        conditionFields: DonationField[];
        conditionFieldId: string;
        setConditionFieldId: (fieldId: string) => void;
        setConditionValue: (value: string) => void;
        conditionValue: string;
        outcomeFieldId: string;
        setOutcomeFieldId: Dispatch<SetStateAction<string>>
        setTarget: Dispatch<SetStateAction<number>>
}

export interface bucketTabObject {
        renderFilters: () => JSX.Element;
        cardStyle: CSSProperties;
        text: string;
        muted: string;
        selectedResponses: DonationResponse[];
        selectedForm: DonationForm;
        inputStyle: CSSProperties;
        bucketPage: number
        refreshResponses: ()=> void
        setBucketPage: Dispatch<SetStateAction<number>>
}
