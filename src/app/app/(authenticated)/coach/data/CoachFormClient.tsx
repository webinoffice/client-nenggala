// src/app/app/(authenticated)/coach/data/CoachFormClient.tsx
"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/app/PageHeader";
import {
  type Coach,
  type BloodType,
  addCoach,
  getCoachByUsername,
  getNextCoachUsername,
  updateCoach,
} from "../_shared/coaches";
import {
  DOJANG_OPTIONS,
  SABUK_OPTIONS,
  WARGA_NEGARA_OPTIONS,
  GOL_DARAH_OPTIONS,
} from "../../student/_shared/students";

const CURRENT_USER = "Carolina";

type Mode = "new" | "edit";
type FormState = {
  username: string;
  namaLengkap: string;
  panggilan: string;
  dojang: string;
  sabuk: string;
  tanggalLahir: string;
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

interface Props {
  mode: Mode;
  username?: string;
}

export default function CoachFormClient({ mode, username }: Props) {
  const router = useRouter();
  const isEditing = mode === "edit";

  const [editing] = useState<Coach | null>(() =>
    isEditing && username ? getCoachByUsername(username) : null,
  );
  const [initialUsername] = useState<string>(
    () => editing?.username ?? getNextCoachUsername(),
  );

  const [form, setForm] = useState<FormState>(() => ({
    username: initialUsername,
    namaLengkap: editing?.namaLengkap ?? "",
    panggilan: editing?.panggilan ?? "",
    dojang: editing?.dojang ?? "",
    sabuk: editing?.sabuk ?? "-",
    tanggalLahir: editing?.tanggalLahir ?? "",
    noHandphone2: editing?.noHandphone2 ?? "",
    warganegara: editing?.warganegara ?? "Indonesia",
    nikKtpPaspor: editing?.nikKtpPaspor ?? "",
    alamatLengkap: editing?.alamatLengkap ?? "",
    kodePos: editing?.kodePos ?? "",
    tinggiBadan: editing ? String(editing.tinggiBadan) : "",
    beratBadan: editing ? String(editing.beratBadan) : "",
    ukuranSepatu: editing ? String(editing.ukuranSepatu) : "",
    namaAyah: editing?.namaAyah ?? "",
    namaIbu: editing?.namaIbu ?? "",
    golDarah: editing?.golDarah ?? "-",
    alergi: editing?.alergi ?? "",
    mulaiLatihan: editing?.mulaiLatihan ?? "",
  }));
  const [errors, setErrors] = useState<Errors>({});

  if (isEditing && !editing) {
    return (
      <>
        <PageHeader title="Coach Not Found" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
          <p className="text-muted text-sm">
            No coach with username{" "}
            <span className="text-ink font-medium">{username}</span>.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/app/coach/data")}
            >
              <ArrowLeft size={16} /> Back to list
            </Button>
          </div>
        </div>
      </>
    );
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.namaLengkap.trim()) next.namaLengkap = "Required";
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

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: Coach = {
      username: form.username,
      namaLengkap: form.namaLengkap.trim(),
      panggilan: form.panggilan.trim(),
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
      status: editing?.status ?? "Active",
      updatedBy: CURRENT_USER,
      updateDate: new Date().toISOString(),
    };
    if (isEditing) updateCoach(form.username, payload);
    else addCoach(payload);
    router.push("/app/coach/data");
  };

  return (
    <>
      <PageHeader
        title={isEditing ? "Update Coach" : "Add Coach"}
        description={
          isEditing
            ? `Editing ${editing?.namaLengkap} (${form.username})`
            : `New coach profile · ${form.username}`
        }
        actions={
          <Button
            variant="outline"
            onClick={() => router.push("/app/coach/data")}
          >
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <div className="space-y-6 max-w-5xl">
        <FormSection title="Identitas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Input label="Username" value={form.username} disabled />
            <Input
              label="Nama Lengkap"
              value={form.namaLengkap}
              onChange={(e) => update("namaLengkap", e.target.value)}
              error={errors.namaLengkap}
              placeholder="e.g. Marvin Hadi"
            />
            <Input
              label="Panggilan"
              value={form.panggilan}
              onChange={(e) => update("panggilan", e.target.value)}
              placeholder="e.g. Marvin"
            />
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
              placeholder="e.g. 3175051405900001"
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
              {DOJANG_OPTIONS.map((d) => (
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
              {SABUK_OPTIONS.map((s) => (
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
              label="No Handphone 2"
              type="tel"
              value={form.noHandphone2}
              onChange={(e) => update("noHandphone2", e.target.value)}
              placeholder="e.g. 0878-1111-1111"
            />
            <Input
              label="Kode Pos"
              value={form.kodePos}
              onChange={(e) =>
                update("kodePos", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              error={errors.kodePos}
              inputMode="numeric"
              placeholder="e.g. 11480"
            />
            <div className="md:col-span-2">
              <Input
                label="Alamat Lengkap"
                value={form.alamatLengkap}
                onChange={(e) => update("alamatLengkap", e.target.value)}
                error={errors.alamatLengkap}
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
            />
            <Input
              label="Berat Badan (kg)"
              type="number"
              value={form.beratBadan}
              onChange={(e) => update("beratBadan", e.target.value)}
              error={errors.beratBadan}
            />
            <Input
              label="Ukuran Sepatu"
              type="number"
              value={form.ukuranSepatu}
              onChange={(e) => update("ukuranSepatu", e.target.value)}
              error={errors.ukuranSepatu}
            />
          </div>
        </FormSection>

        <FormSection title="Orang Tua">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Input
              label="Nama Ayah"
              value={form.namaAyah}
              onChange={(e) => update("namaAyah", e.target.value)}
            />
            <Input
              label="Nama Ibu"
              value={form.namaIbu}
              onChange={(e) => update("namaIbu", e.target.value)}
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

        <div className="flex items-center justify-end gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/app/coach/data")}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Coach"}
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
