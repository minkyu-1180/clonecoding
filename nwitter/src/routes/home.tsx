import { auth } from '../firebase.ts';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  function logOut() {
    auth.signOut();
    navigate('/login');
  }
  return (
    <div>
      <h1>Home!</h1>
      <button onClick={logOut}>로그아웃</button>
    </div>
  );
}
export default Home;
