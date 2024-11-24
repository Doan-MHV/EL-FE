export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  TEACHER = 3,
}

export type Role = {
  id: number | string;
  name?: string;
};
