// src/app/app/(authenticated)/_shared/user-write.ts
//
// Shared create/edit path for the Student / Coach / Admin stores. They all hold
// the same person fields with dojang/belt as NAMES; this resolves those to the
// ids save-user-data expects (belt is null for unranked users — the backend now
// allows that) and posts the multipart write. Keeps the three stores' mutators
// thin: each just calls createUser/editUser with its own UserTypeCode, then
// reloads.
import { saveUserData, type UserWriteInput } from "@/lib/api/users";
import { getDojangs, ensureDojangsLoaded } from "../master/_shared/dojangs";
import { getBeltIdByName, ensureBeltsLoaded } from "../master/_shared/belts";

/** The person fields common to Student/Coach/Admin (dojang/belt by name). */
export interface PersonInput {
  username: string;
  userDataId?: number;
  namaLengkap: string;
  panggilan: string;
  email?: string;
  gender?: string;
  /** Optional — coaches carry no dojang (resolves to null in {@link buildInput}). */
  dojang?: string;
  sabuk: string;
  warganegara: string;
  nikKtpPaspor: string;
  alamatLengkap: string;
  noHandphone1?: string;
  noHandphone2: string;
  kodePos: string;
  tanggalLahir: string;
  tinggiBadan: number;
  beratBadan: number;
  ukuranSepatu: number;
  namaAyah: string;
  namaIbu: string;
  golDarah: string;
  alergi: string;
  mulaiLatihan: string;
}

type UserTypeCode = "S" | "I" | "A";

async function buildInput(
  p: PersonInput,
  fgMode: "I" | "E",
  userTypeCode: UserTypeCode,
  password?: string,
): Promise<UserWriteInput> {
  // The dropdowns are usually hydrated already, but resolve defensively so a
  // submit before hydration doesn't silently send null ids.
  await Promise.all([ensureDojangsLoaded(), ensureBeltsLoaded()]);
  const dojangId =
    getDojangs().find((d) => d.dojangName === p.dojang)?.id ?? null;
  const beltMasterId = getBeltIdByName(p.sabuk); // null for "-"/unknown

  return {
    fgMode,
    userTypeCode,
    userDataId: p.userDataId,
    username: p.username,
    namaLengkap: p.namaLengkap,
    panggilan: p.panggilan,
    email: p.email ?? "",
    gender: p.gender ?? "",
    warganegara: p.warganegara,
    nikKtpPaspor: p.nikKtpPaspor,
    alamatLengkap: p.alamatLengkap,
    noHandphone1: p.noHandphone1 ?? "",
    noHandphone2: p.noHandphone2,
    kodePos: p.kodePos,
    tanggalLahir: p.tanggalLahir,
    tinggiBadan: p.tinggiBadan,
    beratBadan: p.beratBadan,
    ukuranSepatu: p.ukuranSepatu,
    namaAyah: p.namaAyah,
    namaIbu: p.namaIbu,
    golDarah: p.golDarah,
    alergi: p.alergi,
    mulaiLatihan: p.mulaiLatihan,
    dojangId,
    beltMasterId,
    password,
  };
}

/** Insert a new user (backend generates the No.Reg from the type prefix). */
export async function createUser(
  p: PersonInput,
  userTypeCode: UserTypeCode,
  password: string,
  photo: File | null,
): Promise<void> {
  await saveUserData(await buildInput(p, "I", userTypeCode, password), photo);
}

/** Edit an existing user's profile (password/role/status have own endpoints). */
export async function editUser(
  p: PersonInput,
  userTypeCode: UserTypeCode,
  photo: File | null,
): Promise<void> {
  await saveUserData(await buildInput(p, "E", userTypeCode), photo);
}
