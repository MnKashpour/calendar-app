export interface UserInterface {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthUserInterface extends UserInterface {
  defaultCalendarId: number;
}
