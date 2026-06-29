// src/lib/api/users.ts
//
// Typed fetcher + shared row→store mapper for the authenticated user list
// (backend-nenggala POST /user/get-user-data). One endpoint serves students
// (UserTypeCode "S"), coaches ("I") and admins ("A"); the caller picks the type.
//
// Access is enforced server-side by the caller's own role: a super-admin (X)
// must request a specific UserTypeCode; an admin (A) may request S or I only.
//
// The list returns UserId (the User-table PK, used by inact-user-data) and
// UserDataId (the UserData PK that the schedule/attendance/score endpoints join
// on as StudentId/CoachId).
import { apiPost, apiPostForm } from "./client";
import { dmyToIso, dmyhmsToIso } from "./dates";
import type { BloodType } from "@/lib/reference";

export type UserTypeCode = "S" | "A" | "I" | "X";

export interface UserDataRow {
  UserTypeCode: string;
  UserTypeName: string;
  UserId: number;
  UserDataId: number;
  UserNoId: string;
  UserNIK: string | null;
  UserName: string | null;
  UserNickname: string | null;
  UserNationality: string | null;
  UserAddress: string | null;
  UserPhoneNumber1: string | null;
  UserPhoneNumber2: string | null;
  UserPosCode: string | null;
  UserGender: string | null;
  UserEmailAddress: string | null;
  UserHeight: number | null;
  UserWeight: number | null;
  UserShoesSize: number | null;
  UserMotherName: string | null;
  UserFatherName: string | null;
  UserBloodType: string | null;
  DojangName: string | null;
  FgStatus: string;
  UserAlergic: string | null;
  FgAssist: string | null;
  DojangId: number | null;
  /** "dd/mm/yyyy" */
  UserBirthDate: string | null;
  /** "dd/mm/yyyy" */
  UserJoinDate: string | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  UserPhoto: string | null;
}

export function fetchUserData(userType: UserTypeCode): Promise<UserDataRow[]> {
  return apiPost<UserDataRow[]>(
    "/user/get-user-data",
    {
      objParam: {
        ObjSearch: { FieldName: "", FieldValue: "" },
        FgStatus: "",
        UserTypeCode: userType,
        UserName: "",
        BeltName: "",
        UserNoId: "",
        DojangName: "",
      },
    },
    { auth: true },
  );
}

/**
 * Fetch several user types and concatenate them. The backend requires one
 * UserTypeCode per call (a super-admin can't list "everyone" in one request),
 * so the roles master fans out across types. Failing types are skipped so one
 * forbidden type doesn't blank the whole list.
 */
export async function fetchUserDataMany(
  userTypes: UserTypeCode[],
): Promise<UserDataRow[]> {
  const settled = await Promise.allSettled(userTypes.map(fetchUserData));
  return settled.flatMap((r) => (r.status === "fulfilled" ? (r.value ?? []) : []));
}

/**
 * Map a user row onto the common person fields shared by the Student/Coach/Admin
 * stores. `username` = UserNoId (the No.Reg / login name); `userId` = the
 * User-table PK kept for the future status-toggle write. Status is derived from
 * FgStatus by the caller's own union literals.
 */
// ===========================================================================
// Roles-screen writes
// ===========================================================================
// All keyed on UserId (the User-table PK the roles store carries). The backend
// stamps UpdatedBy from the bearer token.

/** inact-user-data — toggle the User.FgStatus ("Y" active / "N" inactive). */
export function inactUserData(
  userId: number,
  fgStatus: "Y" | "N",
): Promise<void> {
  return apiPost<void>(
    "/user/inact-user-data",
    { objParam: { UserId: userId, FgStatus: fgStatus } },
    { auth: true },
  );
}

/** update-user-password — set a new password (the backend hashes it). */
export function updateUserPassword(
  userId: number,
  password: string,
): Promise<void> {
  return apiPost<void>(
    "/user/update-user-password",
    { objParam: { UserId: userId, UserPassword: password } },
    { auth: true },
  );
}

/** update-user-role — change the user's role (User.UserTypeId, resolved from the
 *  UserTypeCode server-side). UserNoId keeps its original prefix. */
export function updateUserRole(
  userId: number,
  userTypeCode: "X" | "A" | "I" | "S",
): Promise<void> {
  return apiPost<void>(
    "/user/update-user-role",
    { objParam: { UserId: userId, UserTypeCode: userTypeCode } },
    { auth: true },
  );
}

/**
 * Common shape the Student/Coach/Admin stores hand to {@link saveUserData}. The
 * stores resolve the dojang/belt NAMES they hold to ids (belt is null for
 * unranked users — the backend now allows that). `password` is insert-only;
 * `userDataId` + `username` are required on edit (the backend fetches the old
 * row by UserNoId to carry the existing photo through).
 */
export interface UserWriteInput {
  fgMode: "I" | "E";
  userTypeCode: "S" | "I" | "A";
  userDataId?: number;
  username?: string; // UserNoId (edit)
  namaLengkap: string;
  panggilan: string;
  email: string;
  gender: string;
  warganegara: string;
  nikKtpPaspor: string;
  alamatLengkap: string;
  noHandphone1: string;
  noHandphone2: string;
  kodePos: string;
  tanggalLahir: string; // "YYYY-MM-DD"
  tinggiBadan: number;
  beratBadan: number;
  ukuranSepatu: number;
  namaAyah: string;
  namaIbu: string;
  golDarah: string;
  alergi: string;
  mulaiLatihan: string; // "YYYY-MM-DD"
  dojangId: number | null;
  beltMasterId: number | null;
  password?: string; // insert
}

/** save-user-data — multipart insert/update of a user profile. The photo rides
 *  as field "UserPhoto"; objParam is a JSON string (standard multipart convention).
 *  On edit with no new photo the backend keeps the existing one. */
export function saveUserData(
  input: UserWriteInput,
  photo: File | null,
): Promise<void> {
  const params: Record<string, unknown> = {
    FgMode: input.fgMode,
    UserName: input.namaLengkap,
    UserNickname: input.panggilan,
    UserEmailAddress: input.email,
    UserGender: input.gender,
    UserNationality: input.warganegara,
    UserNIK: input.nikKtpPaspor,
    UserAddress: input.alamatLengkap,
    UserPhoneNumber1: input.noHandphone1,
    UserPhoneNumber2: input.noHandphone2,
    UserPosCode: input.kodePos,
    UserBirthDate: input.tanggalLahir,
    UserHeight: input.tinggiBadan,
    UserWeight: input.beratBadan,
    UserShoesSize: input.ukuranSepatu,
    UserFatherName: input.namaAyah,
    UserMotherName: input.namaIbu,
    UserBloodType: input.golDarah,
    UserAlergic: input.alergi,
    UserJoinDate: input.mulaiLatihan,
    DojangId: input.dojangId,
    BeltMasterId: input.beltMasterId,
  };
  if (input.fgMode === "I") {
    params.UserTypeCode = input.userTypeCode;
    params.UserPassword = input.password ?? "";
  } else {
    params.UserDataId = input.userDataId ?? 0;
    params.UserNoId = input.username ?? "";
  }

  const form = new FormData();
  form.append("objParam", JSON.stringify(params));
  if (photo) form.append("UserPhoto", photo);
  return apiPostForm<void>("/user/save-user-data", form, { auth: true });
}

export function mapUserRow(r: UserDataRow) {
  return {
    username: r.UserNoId,
    userId: r.UserId,
    userDataId: r.UserDataId,
    namaLengkap: r.UserName ?? "",
    panggilan: r.UserNickname ?? "",
    email: r.UserEmailAddress ?? "",
    gender: r.UserGender ?? "",
    photo: r.UserPhoto ?? "",
    dojang: r.DojangName ?? "",
    sabuk: r.BeltName ?? "-",
    tanggalLahir: dmyToIso(r.UserBirthDate),
    noHandphone1: r.UserPhoneNumber1 ?? "",
    noHandphone2: r.UserPhoneNumber2 ?? "",
    warganegara: r.UserNationality ?? "",
    nikKtpPaspor: r.UserNIK ?? "",
    alamatLengkap: r.UserAddress ?? "",
    kodePos: r.UserPosCode ?? "",
    tinggiBadan: Number(r.UserHeight ?? 0),
    beratBadan: Number(r.UserWeight ?? 0),
    ukuranSepatu: Number(r.UserShoesSize ?? 0),
    namaAyah: r.UserFatherName ?? "",
    namaIbu: r.UserMotherName ?? "",
    golDarah: (r.UserBloodType ?? "O") as BloodType,
    alergi: r.UserAlergic ?? "-",
    mulaiLatihan: dmyToIso(r.UserJoinDate),
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  };
}
