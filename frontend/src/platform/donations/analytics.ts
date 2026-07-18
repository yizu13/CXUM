import type { DonationField, DonationFilters, DonationForm, DonationResponse } from "./types";

export type NumericSummary = {
  field: DonationField;
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number | null;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  p10: number;
  p90: number;
  iqr: number;
  coefficientVariation: number;
  probabilityAtLeastTarget: number;
};

export type CategorySummary = {
  field: DonationField;
  counts: { label: string; value: number }[];
};

export type DonationFormStep = {
  key: string;
  title: string;
  fields: DonationField[];
};

export function passesCondition(field: DonationField, values: Record<string, string | number | boolean>) {
  if (!field.condition) return true;
  const value = values[field.condition.fieldId];
  const expected = field.condition.value.toLowerCase();
  const actualText = String(value ?? "").toLowerCase();
  const actualNumber = Number(value);
  const expectedNumber = Number(field.condition.value);

  if (field.condition.operator === "equals") return actualText === expected;
  if (field.condition.operator === "notEquals") return actualText !== expected;
  if (field.condition.operator === "contains") return actualText.includes(expected);
  if (field.condition.operator === "greaterThan") return Number.isFinite(actualNumber) && actualNumber > expectedNumber;
  return Number.isFinite(actualNumber) && actualNumber < expectedNumber;
}

export function visibleFields(form: DonationForm, values: Record<string, string | number | boolean>) {
  const submenuControllers = form.fields.filter(
    (field) => field.type === "select" && field.optionSubmenus && Object.keys(field.optionSubmenus).length > 0,
  );
  return [...form.fields]
    .sort((a, b) => a.priority - b.priority)
    .filter((field) => passesCondition(field, values))
    .filter((field) => {
      const controllers = submenuControllers.filter((controller) =>
        Object.values(controller.optionSubmenus ?? {}).includes(field.section),
      );
      if (controllers.length === 0) return true;
      return controllers.some((controller) =>
        controller.optionSubmenus?.[String(values[controller.id] ?? "")] === field.section,
      );
    });
}

export function getGuidedFormSteps(form: DonationForm, currentVisibleFields: DonationField[]) {
  if (form.mode !== "guided") return [];

  const orderedFields = [...form.fields].sort((a, b) => a.priority - b.priority);
  const visibleFieldIds = new Set(currentVisibleFields.map((field) => field.id));
  const primaryField = form.primaryFieldId
    ? orderedFields.find((field) => field.id === form.primaryFieldId)
    : undefined;
  const sections = new Map<string, DonationField[]>();

  orderedFields.forEach((field) => {
    if (field.id === primaryField?.id) return;
    const section = field.section || "General";
    sections.set(section, [...(sections.get(section) ?? []), field]);
  });

  const steps: DonationFormStep[] = [];
  if (primaryField) {
    steps.push({
      key: `priority-${primaryField.id}`,
      title: "Dato prioritario",
      fields: visibleFieldIds.has(primaryField.id) ? [primaryField] : [],
    });
  }
  sections.forEach((sectionFields, section) => {
    steps.push({
      key: `section-${section}`,
      title: section,
      fields: sectionFields.filter((field) => visibleFieldIds.has(field.id)),
    });
  });

  return steps;
}

export function filterResponses(
  responses: DonationResponse[],
  filters: DonationFilters,
) {
  return responses.filter((response) => {
    if (filters.formId !== "all" && response.formId !== filters.formId) return false;
    if (filters.source !== "all" && response.source !== filters.source) return false;
    if (filters.device !== "all" && (response.device ?? "unknown") !== filters.device) return false;
    if (filters.location && !response.locationLabel.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.dateFrom && response.submittedAt < new Date(filters.dateFrom).toISOString()) return false;
    if (filters.dateTo) {
      const until = new Date(filters.dateTo);
      until.setHours(23, 59, 59, 999);
      if (response.submittedAt > until.toISOString()) return false;
    }
    if (filters.fieldId && filters.fieldValue) {
      const value = String(response.values[filters.fieldId] ?? "").toLowerCase();
      if (!value.includes(filters.fieldValue.toLowerCase())) return false;
    }
    if (filters.search) {
      const haystack = [
        response.respondentLabel ?? "",
        response.locationLabel,
        response.source,
        response.device ?? "unknown",
        ...Object.values(response.values).map(String),
      ].join(" ").toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function mode(values: number[]) {
  const counts = new Map<number, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  let result: number | null = null;
  let best = 1;
  counts.forEach((count, value) => {
    if (count > best) {
      best = count;
      result = value;
    }
  });
  return result;
}

export function getNumericSummaries(
  form: DonationForm | undefined,
  responses: DonationResponse[],
  target = 100,
): NumericSummary[] {
  if (!form) return [];
  return form.fields
    .filter((field) => field.type === "number")
    .map((field) => {
      const values = responses
        .map((response) => Number(response.values[field.id]))
        .filter((value) => Number.isFinite(value));
      const sorted = [...values].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((total, value) => total + value, 0);
      const mean = count ? sum / count : 0;
      const variance = count ? sorted.reduce((total, value) => total + (value - mean) ** 2, 0) / count : 0;
      return {
        field,
        count,
        sum,
        mean,
        median: percentile(sorted, 0.5),
        mode: mode(sorted),
        variance,
        standardDeviation: Math.sqrt(variance),
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? 0,
        q1: percentile(sorted, 0.25),
        q3: percentile(sorted, 0.75),
        p10: percentile(sorted, 0.1),
        p90: percentile(sorted, 0.9),
        iqr: percentile(sorted, 0.75) - percentile(sorted, 0.25),
        coefficientVariation: mean ? Math.sqrt(variance) / Math.abs(mean) : 0,
        probabilityAtLeastTarget: count ? sorted.filter((value) => value >= target).length / count : 0,
      };
    });
}

export function getConditionalProbability(
  responses: DonationResponse[],
  conditionFieldId: string,
  conditionValue: string,
  outcomeFieldId: string,
  target: number,
) {
  if (!conditionFieldId || !conditionValue || !outcomeFieldId) {
    return { conditionedCount: 0, successCount: 0, probability: 0 };
  }
  const expected = conditionValue.toLowerCase();
  const conditioned = responses.filter(
    (response) => String(response.values[conditionFieldId] ?? "").toLowerCase() === expected,
  );
  const successCount = conditioned.filter((response) => {
    const value = Number(response.values[outcomeFieldId]);
    return Number.isFinite(value) && value >= target;
  }).length;
  return {
    conditionedCount: conditioned.length,
    successCount,
    probability: conditioned.length ? successCount / conditioned.length : 0,
  };
}

export function getHistogram(
  responses: DonationResponse[],
  fieldId: string,
  binCount = 6,
) {
  const values = responses
    .map((response) => Number(response.values[fieldId]))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [{ label: compactRange(min, max), value: values.length }];
  const width = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    from: min + index * width,
    to: index === binCount - 1 ? max : min + (index + 1) * width,
    value: 0,
  }));
  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.floor((value - min) / width));
    bins[index].value += 1;
  });
  return bins.map((bin) => ({ label: compactRange(bin.from, bin.to), value: bin.value }));
}

function compactRange(from: number, to: number) {
  const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
  return from === to ? format(from) : `${format(from)}-${format(to)}`;
}

export function getCategorySummaries(form: DonationForm | undefined, responses: DonationResponse[]) {
  if (!form) return [];
  return form.fields
    .filter((field) => field.type === "select" || field.type === "boolean")
    .map<CategorySummary>((field) => {
      const counts = new Map<string, number>();
      responses.forEach((response) => {
        const label = String(response.values[field.id] ?? "Sin dato");
        counts.set(label, (counts.get(label) ?? 0) + 1);
      });
      return {
        field,
        counts: [...counts.entries()]
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value),
      };
    });
}

export function getTimeSeries(responses: DonationResponse[]) {
  const counts = new Map<string, number>();
  responses.forEach((response) => {
    const date = response.submittedAt.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label: label.slice(5), value }));
}
