import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.ts';
import { FirebaseError } from 'firebase/app';
// CSS
import { styled } from 'styled-components';
// Components
import GithubButton from '../components/github-btn.tsx';

// styled components
// 1. Wrapper
const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 420px;
  padding: 50px 0px;
`;
// 2. Title
const Title = styled.h1`
  font-size: 42px;
`;
// 3. Form
const Form = styled.form`
  margin-top: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
// 4. Input
const Input = styled.input`
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  width: 100%;
  font-size: 16px;
  &[type='submit'] {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
`;
// 5. Error
const Error = styled.span`
  font-weight: 600;
  color: tomato;
`;

// Switcher
const Switcher = styled.div``;
function Login() {
  // 페이지 로딩 여부
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 계정 생성 오류 내용
  const [error, setError] = useState<string>('');
  // 사용자 이메일
  const [email, setEmail] = useState<string>('');
  // 사용자 비밀번호
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  // name, email, password 변경 Event
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name == 'email') {
      setEmail(value);
    } else if (name == 'password') {
      setPassword(value);
    }
  };

  const handleErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return '잘못된 이메일 형식입니다.';
      case 'auth/user-disabled':
        return '사용자가 비활성화되었습니다.';
      case 'auth/user-not-found':
        return '사용자가 존재하지 않습니다.';
      case 'auth/wrong-password':
        return '비밀번호가 일치하지 않습니다.';
      case 'auth/invalid-login-credentials':
        return '이메일이나 비밀번호가 잘못되었습니다.';
      case 'auth/network-request-failed':
        return '네트워크 요청에 실패했습니다.';
      case 'auth/too-many-requests':
        return '너무 많은 요청으로 인해 차단되었습니다. 잠시 후 다시 시도하세요.';
      case 'auth/internal-error':
        return '내부 오류가 발생했습니다.';
      default:
        return '로그인에 실패하였습니다.';
    }
  };
  // form Event
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setError('');
    e.preventDefault();
    // 로딩중이거나 비어있는 항목이 있을 경우
    if (isLoading || email === '' || password === '') {
      setError('모든 필드를 채워주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (e) {
      // 에러 내역 보여주기
      console.log(e);
      if (e instanceof FirebaseError) {
        const message = handleErrorMessage(e.code);
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Wrapper>
        <Title>LOGIN</Title>
        <Form onSubmit={onSubmit}>
          <Input
            onChange={onChange}
            name="email"
            value={email}
            placeholder="Email"
            type="email"
            // required
          />
          <Input
            onChange={onChange}
            name="password"
            value={password}
            placeholder="Password"
            type="password"
            // required
          />
          <Input type="submit" value={isLoading ? 'Loading...' : 'Log In'} />
        </Form>
        {error !== '' ? <Error>{error}</Error> : null}
        <Switcher>
          Don't Have An Account?{' '}
          <Link to="/create-account">Create Account</Link>
        </Switcher>
        <GithubButton />
      </Wrapper>
    </>
  );
}

export default Login;
