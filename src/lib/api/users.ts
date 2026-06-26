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
import { apiPost } from "./client";
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

export function mapUserRow(r: UserDataRow) {
  return {
    username: r.UserNoId,
    userId: r.UserId,
    userDataId: r.UserDataId,
    namaLengkap: r.UserName ?? "",
    panggilan: r.UserNickname ?? "",
    dojang: r.DojangName ?? "",
    sabuk: r.BeltName ?? "-",
    tanggalLahir: dmyToIso(r.UserBirthDate),
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
