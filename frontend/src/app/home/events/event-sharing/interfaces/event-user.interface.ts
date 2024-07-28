import { UserInterface } from '../../../../shared/interfaces/user.interface';

export interface EventUserInterface extends UserInterface {
  userRole: 'viewer' | 'writer' | 'owner';
  userStatus: 'pending' | 'accepted';
}
