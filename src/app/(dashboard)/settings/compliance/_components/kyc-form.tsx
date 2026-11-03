"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import BankAccountField, { EMPTY_BANK } from "@/components/bank-account-field";
import Field from "@/components/field";
import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import StepIndicator from "../../_components/step-indicator";
import { useSubmitMerchantKyc, type BusinessType, type KycBankDetails, type KycSubmission, type KYCData } from "@/hooks/use-kyc";
import { cn } from "@/lib/utils";
import { BUSINESS_TYPES, DOCUMENT_FORMATS, MAX_DIRECTORS, STEPS } from "../_constants";

interface Director {
  fullName: string;
  nin: string;
  bvn: string;
  idDocument: string;
}

interface KycForm {
  type: BusinessType | null;
  companyName: string;
  websiteUrl: string;
  socialUrl: string;
  nin: string;
  bvn: string;
  governmentId: string;
  proofOfAddress: string;
  certificateOfIncorporation: string;
  memorandumArticles: string;
  cacForm7: string;
  cacVariant: "cacForm2" | "cacForm11";
  cacForm2: string;
  cacForm11: string;
  requiresScuml: boolean;
  scumlCertificate: string;
  requiresOperatingLicense: boolean;
  operatingLicense: string;
  statusReport: string;
  proprietorFullName: string;
  proprietorNin: string;
  proprietorBvn: string;
  proprietorId: string;
  directors: Director[];
  bank: KycBankDetails;
}

const EMPTY_DIRECTOR: Director = { fullName: "", nin: "", bvn: "", idDocument: "" };

const initialForm = (kyc?: Partial<KYCData>): KycForm => ({
  // A rejected merchant resubmits with their earlier type and text details; files must go up again.
  type: kyc?.businessRegistration
    ? kyc.businessRegistration === "UNREGISTERED"
      ? "UNREGISTERED"
      : kyc.entityType === "SOLE_PROPRIETOR"
        ? "SOLE_PROPRIETOR"
        : "LIMITED"
    : null,
  companyName: kyc?.companyName ?? "",
  websiteUrl: kyc?.websiteUrl ?? "",
  socialUrl: kyc?.socialUrl ?? "",
  nin: "",
  bvn: "",
  governmentId: "",
  proofOfAddress: "",
  certificateOfIncorporation: "",
  memorandumArticles: "",
  cacForm7: "",
  cacVariant: "cacForm11",
  cacForm2: "",
  cacForm11: "",
  requiresScuml: false,
  scumlCertificate: "",
  requiresOperatingLicense: false,
  operatingLicense: "",
  statusReport: "",
  proprietorFullName: kyc?.proprietorFullName ?? "",
  proprietorNin: "",
  proprietorBvn: "",
  proprietorId: "",
  directors: [{ ...EMPTY_DIRECTOR }],
  bank: { ...EMPTY_BANK },
});

const elevenDigits = (label: string) => z.string().regex(/^\d{11}$/, `${label} must be 11 digits`);
const file = (label: string) => z.string().min(1, `Upload the ${label}`);
const url = z.string().trim().url("Enter a full link, starting with https://").or(z.literal(""));
const name = (label: string) => z.string().trim().min(2, `Enter the ${label}`);

/** Website or social page: at least one, and each one a real link. */
const online = z
  .object({ websiteUrl: url, socialUrl: url })
  .refine((v) => v.websiteUrl || v.socialUrl, { message: "Add a website or a social media page", path: ["websiteUrl"] });

function stepSchema(step: number, form: KycForm): z.ZodTypeAny | null {
  const type = form.type;
  if (step === 1) return z.object({ type: z.string({ message: "Choose your business type" }) });
  if (step === 2) {
    if (type === "UNREGISTERED")
      return online.and(z.object({ nin: elevenDigits("NIN"), bvn: elevenDigits("BVN"), governmentId: file("government ID") }));
    if (type === "SOLE_PROPRIETOR")
      return online.and(
        z.object({
          companyName: name("registered business name"),
          proprietorFullName: name("proprietor's full name"),
          proprietorNin: elevenDigits("NIN"),
          proprietorBvn: elevenDigits("BVN"),
          proprietorId: file("proprietor's ID"),
        }),
      );
    return online.and(
      z.object({
        companyName: name("company name"),
        directors: z
          .array(
            z.object({
              fullName: name("director's full name"),
              nin: elevenDigits("NIN"),
              bvn: elevenDigits("BVN"),
              idDocument: file("director's ID"),
            }),
          )
          .min(1),
      }),
    );
  }
  if (step === 3) {
    if (type === "UNREGISTERED") return z.object({ proofOfAddress: file("proof of address") });
    if (type === "SOLE_PROPRIETOR")
      return z.object({
        certificateOfIncorporation: file("certificate of registration"),
        statusReport: file("status report"),
        proofOfAddress: file("proof of address"),
      });
    return z
      .object({
        certificateOfIncorporation: file("certificate of incorporation"),
        memorandumArticles: file("Memorandum & Articles"),
        cacForm7: file("CAC Form 7"),
        proofOfAddress: file("proof of address"),
        [form.cacVariant]: file(form.cacVariant === "cacForm2" ? "CAC Form 2" : "CAC Form 1.1"),
      })
      .and(
        z.object({
          scumlCertificate: form.requiresScuml ? file("SCUML certificate") : z.string(),
          operatingLicense: form.requiresOperatingLicense ? file("operating licence") : z.string(),
        }),
      );
  }
  if (step === 4)
    return z.object({
      bank: z.object({ accountName: z.string().min(1, "Enter an account we can verify") }),
    });
  return null;
}

function toSubmission(form: KycForm): KycSubmission {
  const base = {
    country: "NG",
    proofOfAddress: form.proofOfAddress,
    // The API only accepts public URLs, so local dev servers skip the return link.
    ...(!/^(localhost|127\.|\[::1\])/.test(window.location.hostname) && {
      redirectUrl: `${window.location.origin}/settings/compliance`,
    }),
    ...(form.websiteUrl.trim() && { websiteUrl: form.websiteUrl.trim() }),
    ...(form.socialUrl.trim() && { socialUrl: form.socialUrl.trim() }),
  };
  if (form.type === "UNREGISTERED")
    return {
      type: "UNREGISTERED",
      payload: { ...base, nin: form.nin, bvn: form.bvn, governmentId: form.governmentId, personalBank: form.bank },
    };
  if (form.type === "SOLE_PROPRIETOR")
    return {
      type: "SOLE_PROPRIETOR",
      payload: {
        ...base,
        companyName: form.companyName.trim(),
        corporateBank: form.bank,
        certificateOfIncorporation: form.certificateOfIncorporation,
        statusReport: form.statusReport,
        proprietorFullName: form.proprietorFullName.trim(),
        proprietorNin: form.proprietorNin,
        proprietorBvn: form.proprietorBvn,
        proprietorId: form.proprietorId,
      },
    };
  return {
    type: "LIMITED",
    payload: {
      ...base,
      companyName: form.companyName.trim(),
      corporateBank: form.bank,
      certificateOfIncorporation: form.certificateOfIncorporation,
      memorandumArticles: form.memorandumArticles,
      cacForm7: form.cacForm7,
      [form.cacVariant]: form[form.cacVariant],
      directors: form.directors.map((d) => ({ ...d, fullName: d.fullName.trim() })),
      requiresScuml: form.requiresScuml,
      ...(form.requiresScuml && { scumlCertificate: form.scumlCertificate }),
      requiresOperatingLicense: form.requiresOperatingLicense,
      ...(form.requiresOperatingLicense && { operatingLicense: form.operatingLicense }),
    },
  };
}

/** Upload box for one KYC document; `field` is the multipart field name the API expects. */
function DocumentUpload({
  field,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  field: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (key: string) => void;
}) {
  return (
    <Field error={error} hint={hint}>
      <FileUpload
        type="file"
        fileName={field}
        label={label}
        value={value || null}
        acceptedFormats={DOCUMENT_FORMATS}
        maxSizeInMB={10}
        className="h-32"
        onFileSelect={(key) => onChange(key ?? "")}
      />
    </Field>
  );
}

/**
 * The merchant KYC submission: business type → details (and each person's ID) → business documents →
 * payout account → review. Files upload as they're picked; the JSON goes to the route for the type.
 */
export default function KycForm({
  kyc,
  resubmitting,
  onSubmitted,
}: {
  kyc?: Partial<KYCData>;
  resubmitting: boolean;
  /** Called with the LedgerBlock link (if any) once the submission is accepted. */
  onSubmitted: (result: { verificationUrl: string | null; registered: boolean }) => void;
}) {
  const [form, setForm] = useState<KycForm>(() => initialForm(resubmitting ? kyc : undefined));
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { submitKyc, isSubmitting } = useSubmitMerchantKyc();

  const set = <K extends keyof KycForm>(key: K, value: KycForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };
  const setDirector = (index: number, patch: Partial<Director>) =>
    set(
      "directors",
      form.directors.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );

  const validate = () => {
    const schema = stepSchema(step, form);
    if (!schema) return true;
    const result = schema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!next[path]) next[path] = issue.message;
    }
    setErrors(next);
    toast.error(result.error.issues[0]?.message ?? "Check the highlighted fields");
    return false;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < STEPS.length) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      const result = await submitKyc(toSubmission(form));
      onSubmitted({ verificationUrl: result.verificationUrl, registered: form.type !== "UNREGISTERED" });
    } catch (error) {
      toast.error((error as Error).message || "We couldn't submit your details. Please try again.");
    }
  };

  const selectedType = BUSINESS_TYPES.find((t) => t.value === form.type);
  const isRegistered = form.type === "LIMITED" || form.type === "SOLE_PROPRIETOR";

  const onlineFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Website" htmlFor="kyc-website" error={errors.websiteUrl}>
        <Input
          id="kyc-website"
          type="url"
          inputMode="url"
          value={form.websiteUrl}
          onChange={(e) => set("websiteUrl", e.target.value)}
          placeholder="https://yourbusiness.com"
        />
      </Field>
      <Field label="Social media page" htmlFor="kyc-social" error={errors.socialUrl} hint="Instagram, Facebook, X or TikTok">
        <Input
          id="kyc-social"
          type="url"
          inputMode="url"
          value={form.socialUrl}
          onChange={(e) => set("socialUrl", e.target.value)}
          placeholder="https://instagram.com/yourbusiness"
        />
      </Field>
    </div>
  );

  const idNumbers = (prefix: string, nin: string, bvn: string, onNin: (v: string) => void, onBvn: (v: string) => void, ninError?: string, bvnError?: string) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="NIN" htmlFor={`${prefix}-nin`} error={ninError}>
        <Input id={`${prefix}-nin`} inputMode="numeric" maxLength={11} value={nin} onChange={(e) => onNin(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="11 digits" />
      </Field>
      <Field label="BVN" htmlFor={`${prefix}-bvn`} error={bvnError}>
        <Input id={`${prefix}-bvn`} inputMode="numeric" maxLength={11} value={bvn} onChange={(e) => onBvn(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="11 digits" />
      </Field>
    </div>
  );

  return (
    <div className="mt-6 rounded-2xl border bg-card px-4 pb-6 pt-1 sm:px-6">
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
        {resubmitting ? "Update and resubmit your details" : "Complete your verification"}
      </h3>
      <StepIndicator currentStep={step} steps={STEPS} className="mb-10" />

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {step === 1 && (
          <div role="radiogroup" aria-label="Business type" className="grid gap-3">
            {BUSINESS_TYPES.map((option) => {
              const active = form.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("type", option.value)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors",
                    active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-display font-bold text-foreground">{option.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                    </span>
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </span>
                  <span className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    You&apos;ll need
                  </span>
                  <ul className="mt-1 grid gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                    {option.needs.map((need) => (
                      <li key={need} className="flex gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" /> {need}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && form.type === "UNREGISTERED" && (
          <>
            {idNumbers("kyc", form.nin, form.bvn, (v) => set("nin", v), (v) => set("bvn", v), errors.nin, errors.bvn)}
            <DocumentUpload
              field="governmentId"
              label="Government ID"
              hint="International passport, driver's licence or NIN slip"
              value={form.governmentId}
              error={errors.governmentId}
              onChange={(key) => set("governmentId", key)}
            />
            {onlineFields}
          </>
        )}

        {step === 2 && form.type === "SOLE_PROPRIETOR" && (
          <>
            <Field label="Registered business name" htmlFor="kyc-company" error={errors.companyName} hint="Exactly as it appears on your CAC certificate">
              <Input id="kyc-company" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </Field>
            {onlineFields}
            <div className="rounded-2xl border p-4">
              <p className="mb-3 text-sm font-bold text-foreground">Proprietor</p>
              <div className="space-y-4">
                <Field label="Full name" htmlFor="kyc-proprietor" error={errors.proprietorFullName}>
                  <Input id="kyc-proprietor" value={form.proprietorFullName} onChange={(e) => set("proprietorFullName", e.target.value)} />
                </Field>
                {idNumbers("kyc-proprietor", form.proprietorNin, form.proprietorBvn, (v) => set("proprietorNin", v), (v) => set("proprietorBvn", v), errors.proprietorNin, errors.proprietorBvn)}
                <DocumentUpload
                  field="proprietorId"
                  label="Proprietor's ID"
                  hint="International passport, driver's licence or NIN slip"
                  value={form.proprietorId}
                  error={errors.proprietorId}
                  onChange={(key) => set("proprietorId", key)}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && form.type === "LIMITED" && (
          <>
            <Field label="Company name" htmlFor="kyc-company" error={errors.companyName} hint="Exactly as it appears on your certificate of incorporation">
              <Input id="kyc-company" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </Field>
            {onlineFields}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-foreground">Directors</p>
                <p className="text-xs text-muted-foreground">Add every director, up to {MAX_DIRECTORS}.</p>
              </div>
              {form.directors.map((director, i) => (
                <div key={i} className="rounded-2xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Director {i + 1}</p>
                    {form.directors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set("directors", form.directors.filter((_, j) => j !== i))}
                        aria-label={`Remove director ${i + 1}`}
                        className="grid h-8 w-8 place-items-center rounded-full text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Field label="Full name" htmlFor={`kyc-director-${i}`} error={errors[`directors.${i}.fullName`]}>
                      <Input id={`kyc-director-${i}`} value={director.fullName} onChange={(e) => setDirector(i, { fullName: e.target.value })} />
                    </Field>
                    {idNumbers(
                      `kyc-director-${i}`,
                      director.nin,
                      director.bvn,
                      (v) => setDirector(i, { nin: v }),
                      (v) => setDirector(i, { bvn: v }),
                      errors[`directors.${i}.nin`],
                      errors[`directors.${i}.bvn`],
                    )}
                    <DocumentUpload
                      // Each director slot has its own upload field.
                      field={`directorId${i + 1}`}
                      label="Director's ID"
                      hint="International passport, driver's licence or NIN slip"
                      value={director.idDocument}
                      error={errors[`directors.${i}.idDocument`]}
                      onChange={(key) => setDirector(i, { idDocument: key })}
                    />
                  </div>
                </div>
              ))}
              {form.directors.length < MAX_DIRECTORS && (
                <Button type="button" variant="outline" onClick={() => set("directors", [...form.directors, { ...EMPTY_DIRECTOR }])}>
                  <Plus /> Add director
                </Button>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {form.type === "SOLE_PROPRIETOR" && (
              <>
                <DocumentUpload field="certificateOfIncorporation" label="Certificate of registration" value={form.certificateOfIncorporation} error={errors.certificateOfIncorporation} onChange={(key) => set("certificateOfIncorporation", key)} />
                <DocumentUpload field="statusReport" label="Status report" hint="From the CAC portal" value={form.statusReport} error={errors.statusReport} onChange={(key) => set("statusReport", key)} />
              </>
            )}
            {form.type === "LIMITED" && (
              <>
                <DocumentUpload field="certificateOfIncorporation" label="Certificate of incorporation" value={form.certificateOfIncorporation} error={errors.certificateOfIncorporation} onChange={(key) => set("certificateOfIncorporation", key)} />
                <DocumentUpload field="memorandumArticles" label="Memorandum & Articles of Association" hint="Certified true copy" value={form.memorandumArticles} error={errors.memorandumArticles} onChange={(key) => set("memorandumArticles", key)} />
                <DocumentUpload field="cacForm7" label="CAC Form 7 (particulars of directors)" hint="Certified true copy" value={form.cacForm7} error={errors.cacForm7} onChange={(key) => set("cacForm7", key)} />
                <div className="space-y-2">
                  <div role="radiogroup" aria-label="Share allotment form" className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
                    {(
                      [
                        ["cacForm11", "CAC 1.1 (after 2017)"],
                        ["cacForm2", "CAC Form 2"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={form.cacVariant === value}
                        onClick={() => set("cacVariant", value)}
                        className={cn(
                          "min-h-[34px] rounded-full px-2",
                          form.cacVariant === value ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <DocumentUpload
                    key={form.cacVariant}
                    field={form.cacVariant}
                    label={form.cacVariant === "cacForm2" ? "CAC Form 2 (allotment of shares)" : "CAC Form 1.1 (application for registration)"}
                    hint="Certified true copy"
                    value={form[form.cacVariant]}
                    error={errors[form.cacVariant]}
                    onChange={(key) => set(form.cacVariant, key)}
                  />
                </div>
              </>
            )}
            <DocumentUpload
              field="proofOfAddress"
              label={form.type === "UNREGISTERED" ? "Proof of business or home address" : "Proof of business address"}
              hint="Utility bill or bank statement from the last 3 months"
              value={form.proofOfAddress}
              error={errors.proofOfAddress}
              onChange={(key) => set("proofOfAddress", key)}
            />
            {form.type === "LIMITED" && (
              <div className="space-y-4 sm:col-span-2">
                {(
                  [
                    ["requiresScuml", "scumlCertificate", "SCUML certificate", "Needed for designated non-financial businesses (e.g. hotels, car dealers, real estate)."],
                    ["requiresOperatingLicense", "operatingLicense", "Operating licence", "Needed if a regulator licenses your business."],
                  ] as const
                ).map(([flag, field, label, hint]) => (
                  <div key={flag} className="rounded-2xl border p-4">
                    <label className="flex items-start justify-between gap-4">
                      <span>
                        <span className="block text-sm font-semibold text-foreground">My business needs a {label.toLowerCase()}</span>
                        <span className="block text-xs text-muted-foreground">{hint}</span>
                      </span>
                      <Switch checked={form[flag]} onCheckedChange={(checked) => set(flag, checked)} aria-label={`Requires ${label}`} />
                    </label>
                    {form[flag] && (
                      <div className="mt-4">
                        <DocumentUpload field={field} label={label} value={form[field]} error={errors[field]} onChange={(key) => set(field, key)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <>
            <p className="text-sm text-muted-foreground">
              {isRegistered
                ? "Payouts go to this account. It must be in the business's registered name."
                : "Payouts go to this account. Use an account in your own name."}
            </p>
            <BankAccountField
              resolveWith="kyc"
              idPrefix="kyc-bank"
              label={isRegistered ? "Corporate bank" : "Personal bank"}
              value={form.bank}
              onChange={(bank) => set("bank", bank)}
            />
            {errors["bank.accountName"] && !form.bank.accountName && (
              <p className="text-[11px] font-medium text-destructive">{errors["bank.accountName"]}</p>
            )}
          </>
        )}

        {step === 5 && selectedType && (
          <dl className="divide-y rounded-2xl border px-4 text-sm">
            {(
              [
                ["Business type", selectedType.title],
                isRegistered && ["Business name", form.companyName],
                form.type === "SOLE_PROPRIETOR" && ["Proprietor", form.proprietorFullName],
                form.type === "LIMITED" && ["Directors", form.directors.map((d) => d.fullName).join(", ")],
                ["Website", form.websiteUrl || "—"],
                ["Social media", form.socialUrl || "—"],
                ["Payout account", `${form.bank.accountName} · ${form.bank.accountNumber}`],
                ["Documents", "Uploaded"],
              ].filter(Boolean) as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </motion.div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        {step > 1 && (
          <Button type="button" size="lg" variant="outline" className="sm:flex-1" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
            Back
          </Button>
        )}
        <Button type="button" size="lg" variant="brand" className="sm:flex-1" onClick={next} disabled={isSubmitting || (step === 1 && !form.type)}>
          {isSubmitting ? "Submitting…" : step === STEPS.length ? "Submit for verification" : "Continue"}
        </Button>
      </div>

    </div>
  );
}
