export type DonationFieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "date"
  | "email"
  | "phone"
  | "boolean";

export type DonationFormStatus = "draft" | "published" | "private" | "hidden";
export type DonationFormMode = "flat" | "guided";
export type DonationSelectDisplay = "autocomplete" | "cards";
export type DonationSelectMode = "single" | "multiple";
export type DonationValue = string | number | boolean | string[];
export type DonationRepeatedValues = Record<string, Record<string, Record<string, DonationValue>>>;

export type ConditionalRule = {
  fieldId: string;
  operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  value: string;
};

export type DonationField = {
  id: string;
  label: string;
  type: DonationFieldType;
  required: boolean;
  priority: number;
  section: string;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  selectDisplay?: DonationSelectDisplay;
  selectionMode?: DonationSelectMode;
  createRecordPerSelection?: boolean;
  repeatSubmenuPerSelection?: boolean;
  optionSubmenus?: Record<string, string>;
  condition?: ConditionalRule;
};

export type DonationForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  headerIcon?: string;
  eventDate?: string;
  status: DonationFormStatus;
  mode: DonationFormMode;
  primaryFieldId?: string;
  respondentFieldId?: string;
  respondentSubmissionLimit?: number;
  locationFieldId?: string;
  thankYouMessage: string;
  allowRepeatSubmissions?: boolean;
  fields: DonationField[];
  createdAt: string;
  updatedAt: string;
};

export type DonationResponse = {
  id: string;
  formId: string;
  submittedAt: string;
  source: "qr" | "link" | "direct";
  respondentLabel?: string;
  locationLabel: string;
  device?: "mobile" | "tablet" | "desktop" | "unknown";
  userAgent?: string;
  submissionGroupId?: string;
  splitFieldId?: string;
  splitOption?: string;
  splitRecordIndex?: number;
  splitRecordCount?: number;
  values: Record<string, DonationValue>;
};

export type DonationFilters = {
  formId: string;
  search: string;
  source: "all" | DonationResponse["source"];
  device: "all" | NonNullable<DonationResponse["device"]>;
  location: string;
  dateFrom: string;
  dateTo: string;
  fieldId: string;
  fieldValue: string;
};
