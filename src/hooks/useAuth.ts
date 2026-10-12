import { useProject } from '../context/ProjectContext';
import { TeamMember } from '../types';

export const useAuth = () => {
  const { currentUser, teamMembers = [], setCurrentUser } = useProject();

  const isOwnerOrAdmin = currentUser?.role?.includes('راهبر') || currentUser?.id === 'usr_owner';

  const switchUser = (memberId: string) => {
    const found = teamMembers.find(m => m.id === memberId || m.name.includes(memberId));
    if (found && setCurrentUser) {
      setCurrentUser(found);
    }
  };

  return {
    currentUser: currentUser || {
      id: 'usr_owner',
      name: 'علی طهمورث',
      role: 'راهبر ارشد توسعه',
      department: 'wp_dev',
      avatar: 'ع',
      status: 'online'
    },
    isOwnerOrAdmin,
    teamMembers,
    switchUser
  };
};
