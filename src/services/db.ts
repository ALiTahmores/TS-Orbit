import { User, Workspace } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: "usr_master_alitahmores",
    name: "علی طهمورث",
    username: "alitahmores",
    email: "alitahmores343412@gmail.com",
    phone: "09123456789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores",
    status: "ACTIVE",
    personalWorkspaceId: "ws_alitahmores_primary",
    memberships: [
      {
        workspaceId: "ws_alitahmores_primary",
        workspaceName: "فضای کاری علی طهمورث",
        role: "OWNER",
        permissions: ["all"],
        joinedAt: new Date().toISOString()
      }
    ]
  }
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: "ws_alitahmores_primary",
    name: "فضای کاری علی طهمورث",
    ownerId: "usr_master_alitahmores",
    inviteCode: "ORBITMASTER",
    members: [
      {
        userId: "usr_master_alitahmores",
        role: "OWNER",
        permissions: ["all"],
        name: "علی طهمورث",
        username: "alitahmores",
        email: "alitahmores343412@gmail.com",
        phone: "09123456789",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores"
      }
    ]
  }
];
