// src/app/app/(authenticated)/admin/AdminFormClient.tsx
"use client";
import { getCurrentUsername } from "@/lib/current-user";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/app/PageHeader";
import {
  type Admin,
  type BloodType,
  addAdmin,
  getAdminByUsername,
  getNextUsername,
  updateAdmin,
} from "./_shared/admins";
import {
  GENDER_OPTIONS,
  GOL_DARAH_OPTIONS,
  WARGA_NEGARA_OPTIONS,
} from "@/lib/reference";
import { fileUrl } from "@/lib/api/file-url";
import { useDojangOptions } from "../master/_shared/dojangs";
import { useSabukOptions } from "../master/_shared/belts";


type Mode = "new" | "edit";

type FormState = {
  username: string;
  namaLengkap: string;
  panggilan: string;
  email: string;
  gender: string;
  password: string;
  dojang: string;
  sabuk: string;
  tanggalLahir: string;
  noHandphone1: string;
  noHandphone2: string;
  warganegara: string;
  nikKtpPaspor: string;
  alamatLengkap: string;
  kodePos: string;
  tinggiBadan: string;
  beratBadan: string;
  ukuranSepatu: string;
  namaAyah: string;
  namaIbu: string;
  golDarah: BloodType;
  alergi: string;
  mulaiLatihan: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

interface AdminFormClientProps {
  mode: Mode;
  username?: string;
}

export default function AdminFormClient({
  mode,
  username,
}: AdminFormClientProps) {
  const router = useRouter();
  const isEditing = mode === "edit";
  const dojangOptions = useDojangOptions();
  const sabukOptions = useSabukOptions();

  // Read once on mount — both the target admin and the next free username.
  const [editingAdmin] = useState<Admin | null>(() =>
    isEditing && username ? getAdminByUsername(username) : null,
  );
  const [initialUsername] = useState<string>(
    () => editingAdmin?.username ?? getNextUsername(),
  );

  const [form, setForm] = useState<FormState>(() => ({
    username: initialUsername,
    namaLengkap: editingAdmin?.namaLengkap ?? "",
    panggilan: editingAdmin?.panggilan ?? "",
    email: editingAdmin?.email ?? "",
    gender: editingAdmin?.gender ?? "",
    password: "",
    dojang: editingAdmin?.dojang ?? "",
    sabuk: editingAdmin?.sabuk ?? "-",
    tanggalLahir: editingAdmin?.tanggalLahir ?? "",
    noHandphone1: editingAdmin?.noHandphone1 ?? "",
    noHandphone2: editingAdmin?.noHandphone2 ?? "",
    warganegara: editingAdmin?.warganegara ?? "Indonesia",
    nikKtpPaspor: editingAdmin?.nikKtpPaspor ?? "",
    alamatLengkap: editingAdmin?.alamatLengkap ?? "",
    kodePos: editingAdmin?.kodePos ?? "",
    tinggiBadan: editingAdmin ? String(editingAdmin.tinggiBadan) : "",
    beratBadan: editingAdmin ? String(editingAdmin.beratBadan) : "",
    ukuranSepatu: editingAdmin ? String(editingAdmin.ukuranSepatu) : "",
    namaAyah: editingAdmin?.namaAyah ?? "",
    namaIbu: editingAdmin?.namaIbu ?? "",
    golDarah: editingAdmin?.golDarah ?? "-",
    alergi: editingAdmin?.alergi ?? "",
    mulaiLatihan: editingAdmin?.mulaiLatihan ?? "",
  }));

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Edit-mode not-found state (after hooks, per rules of hooks).
  if (isEditing && !editingAdmin) {
    return (
      <>
        <PageHeader title="Admin Not Found" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
          <p className="text-muted text-sm">
            No admin with username{" "}
            <span className="text-ink font-medium">{username}</span> exists.
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.push("/app/admin")}>
              <ArrowLeft size={16} />
              Back to list
            </Button>
          </div>
        </div>
      </>
    );
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.namaLengkap.trim()) next.namaLengkap = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Invalid email";
    if (!isEditing && !form.password) next.password = "Required";
    else if (!isEditing && form.password.length < 6)
      next.password = "Min 6 characters";
    if (!form.dojang) next.dojang = "Required";
    if (!form.tanggalLahir) next.tanggalLahir = "Required";
    if (!form.warganegara) next.warganegara = "Required";
    if (!form.nikKtpPaspor.trim()) next.nikKtpPaspor = "Required";
    else if (form.nikKtpPaspor.trim().length < 8)
      next.nikKtpPaspor = "Too short";
    if (!form.alamatLengkap.trim()) next.alamatLengkap = "Required";
    if (!form.kodePos.trim()) next.kodePos = "Required";
    else if (!/^\d{5}$/.test(form.kodePos.trim()))
      next.kodePos = "Must be 5 digits";
    if (!form.mulaiLatihan) next.mulaiLatihan = "Required";
    else if (form.tanggalLahir && form.mulaiLatihan < form.tanggalLahir)
      next.mulaiLatihan = "Cannot be before date of birth";

    if (form.tinggiBadan && Number.isNaN(Number(form.tinggiBadan)))
      next.tinggiBadan = "Numbers only";
    if (form.beratBadan && Number.isNaN(Number(form.beratBadan)))
      next.beratBadan = "Numbers only";
    if (form.ukuranSepatu && Number.isNaN(Number(form.ukuranSepatu)))
      next.ukuranSepatu = "Numbers only";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;

    const payload: Admin = {
      username: form.username,
      userDataId: editingAdmin?.userDataId,
      namaLengkap: form.namaLengkap.trim(),
      panggilan: form.panggilan.trim(),
      email: form.email.trim(),
      gender: form.gender,
      noHandphone1: form.noHandphone1.trim(),
      dojang: form.dojang,
      sabuk: form.sabuk,
      tanggalLahir: form.tanggalLahir,
      noHandphone2: form.noHandphone2.trim(),
      warganegara: form.warganegara,
      nikKtpPaspor: form.nikKtpPaspor.trim(),
      alamatLengkap: form.alamatLengkap.trim(),
      kodePos: form.kodePos.trim(),
      tinggiBadan: Number(form.tinggiBadan) || 0,
      beratBadan: Number(form.beratBadan) || 0,
      ukuranSepatu: Number(form.ukuranSepatu) || 0,
      namaAyah: form.namaAyah.trim(),
      namaIbu: form.namaIbu.trim(),
      golDarah: form.golDarah,
      alergi: form.alergi.trim() || "-",
      mulaiLatihan: form.mulaiLatihan,
      status: editingAdmin?.status ?? "Active",
      updatedBy: getCurrentUsername(),
      updateDate: new Date().toISOString(),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditing) await updateAdmin(form.username, payload, photoFile);
      else await addAdmin(payload, form.password, photoFile);
      router.push("/app/admin");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to save admin");
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.push("/app/admin");

  return (
    <>
      <PageHeader
        title={isEditing ? "Update Admin" : "Add Admin"}
        description={
          isEditing
            ? `Editing ${editingAdmin?.namaLengkap} (${form.username})`
            : `New admin profile · ${form.username}`
        }
        actions={
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div className="space-y-6 max-w-5xl">
        <FormSection title="Identitas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Input
              label="No. Reg"
              value={isEditing ? form.username : "Auto-generated on save"}
              disabled
            />
            <Input
              label="Nama Lengkap"
              value={form.namaLengkap}
              onChange={(e) => update("namaLengkap", e.target.value)}
              error={errors.namaLengkap}
              placeholder="e.g. Fathir Ramadhan"
            />
            <Input
              label="Panggilan"
              value={form.panggilan}
              onChange={(e) => update("panggilan", e.target.value)}
              placeholder="e.g. Fathir"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              placeholder="e.g. nama@email.com"
            />
            <Select
              label="Jenis Kelamin"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Pilih Jenis Kelamin</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <Input
              label="Tanggal Lahir"
              type="date"
              value={form.tanggalLahir}
              onChange={(e) => update("tanggalLahir", e.target.value)}
              error={errors.tanggalLahir}
            />
            <Select
              label="Warga Negara"
              value={form.warganegara}
              onChange={(e) => update("warganegara", e.target.value)}
              error={errors.warganegara}
            >
              {WARGA_NEGARA_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
            <Input
              label="NIK KTP / Paspor"
              value={form.nikKtpPaspor}
              onChange={(e) => update("nikKtpPaspor", e.target.value)}
              error={errors.nikKtpPaspor}
              placeholder="e.g. 3179080705470005"
            />
          </div>
        </FormSection>

        <FormSection title="Dojang & Sabuk">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Select
              label="Dojang"
              value={form.dojang}
              onChange={(e) => update("dojang", e.target.value)}
              error={errors.dojang}
            >
              <option value="">Pilih Dojang</option>
              {dojangOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select
              label="Sabuk"
              value={form.sabuk}
              onChange={(e) => update("sabuk", e.target.value)}
            >
              {sabukOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Input
              label="Mulai Latihan"
              type="date"
              value={form.mulaiLatihan}
              onChange={(e) => update("mulaiLatihan", e.target.value)}
              error={errors.mulaiLatihan}
            />
          </div>
        </FormSection>

        <FormSection title="Kontak & Alamat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Input
              label="No Handphone 1"
              type="tel"
              value={form.noHandphone1}
              onChange={(e) => update("noHandphone1", e.target.value)}
              placeholder="e.g. 0878-5234-2342"
            />
            <Input
              label="No Handphone 2"
              type="tel"
              value={form.noHandphone2}
              onChange={(e) => update("noHandphone2", e.target.value)}
              placeholder="e.g. 0878-5234-2342"
            />
            <Input
              label="Kode Pos"
              value={form.kodePos}
              onChange={(e) =>
                update("kodePos", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              error={errors.kodePos}
              inputMode="numeric"
              placeholder="e.g. 15510"
            />
            <div className="md:col-span-2">
              <Input
                label="Alamat Lengkap"
                value={form.alamatLengkap}
                onChange={(e) => update("alamatLengkap", e.target.value)}
                error={errors.alamatLengkap}
                placeholder="e.g. Sutera Orlanda II No.10, Pakualam Tangerang"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Data Fisik">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <Input
              label="Tinggi Badan (cm)"
              type="number"
              value={form.tinggiBadan}
              onChange={(e) => update("tinggiBadan", e.target.value)}
              error={errors.tinggiBadan}
              placeholder="e.g. 150"
            />
            <Input
              label="Berat Badan (kg)"
              type="number"
              value={form.beratBadan}
              onChange={(e) => update("beratBadan", e.target.value)}
              error={errors.beratBadan}
              placeholder="e.g. 57"
            />
            <Input
              label="Ukuran Sepatu"
              type="number"
              value={form.ukuranSepatu}
              onChange={(e) => update("ukuranSepatu", e.target.value)}
              error={errors.ukuranSepatu}
              placeholder="e.g. 38"
            />
          </div>
        </FormSection>

        <FormSection title="Orang Tua">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Input
              label="Nama Ayah"
              value={form.namaAyah}
              onChange={(e) => update("namaAyah", e.target.value)}
              placeholder="e.g. Christoper"
            />
            <Input
              label="Nama Ibu"
              value={form.namaIbu}
              onChange={(e) => update("namaIbu", e.target.value)}
              placeholder="e.g. Jessica"
            />
          </div>
        </FormSection>

        <FormSection title="Kesehatan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Select
              label="Gol Darah"
              value={form.golDarah}
              onChange={(e) => update("golDarah", e.target.value as BloodType)}
            >
              {GOL_DARAH_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <Input
              label="Alergi"
              value={form.alergi}
              onChange={(e) => update("alergi", e.target.value)}
              placeholder="e.g. Kacang (or leave blank)"
            />
          </div>
        </FormSection>

        <FormSection title="Akun & Foto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {!isEditing && (
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
                placeholder="Min. 6 characters"
              />
            )}
            <div className="flex flex-col gap-2">
              <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
                Foto
              </label>
              {isEditing && editingAdmin?.photo && !photoFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileUrl(editingAdmin.photo)}
                  alt={form.namaLengkap}
                  className="h-20 w-20 rounded-sm border border-ink/10 object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/15 file:bg-paper-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ink hover:file:bg-paper"
              />
              {photoFile && (
                <p className="text-xs text-muted">Selected: {photoFile.name}</p>
              )}
              {isEditing && (
                <p className="text-xs text-muted">
                  Leave empty to keep the current photo.
                </p>
              )}
            </div>
          </div>
        </FormSection>

        {submitError && (
          <p className="text-sm text-brand text-right">{submitError}</p>
        )}
        <div className="flex items-center justify-end gap-2 pt-2 pb-4">
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add Admin"}
          </Button>
        </div>
      </div>
    </>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-paper rounded-sm border border-ink/10 p-6">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}
