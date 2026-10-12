import React from 'react';
import { AuthModal } from './auth/AuthModal';

export const AuthPortal: React.FC = () => {
  return <AuthModal isOpen={true} />;
};

export default AuthPortal;
