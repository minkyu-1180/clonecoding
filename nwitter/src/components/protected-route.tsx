import { auth } from '../firebase.ts';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 현재 인증된 유저
  const user = auth.currentUser;

  // user값이 Null일 경우
  if (!user) {
    // 로그인 페이지로 Navigate
    return <Navigate to="/login" />;
  }
  return <div>{children}</div>;
}

export default ProtectedRoute;
