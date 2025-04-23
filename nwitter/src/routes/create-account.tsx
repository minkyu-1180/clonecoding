// firebase
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase.ts';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';

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
function CreateAccount() {
  // 페이지 로딩 여부
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 계정 생성 오류 내용
  const [error, setError] = useState<string>('');
  // 사용자 이름
  const [name, setName] = useState<string>('');
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
    if (name == 'name') {
      setName(value);
    } else if (name == 'email') {
      setEmail(value);
    } else if (name == 'password') {
      setPassword(value);
    }
  };
  // form Event
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 로딩중이거나 비어있는 항목이 있을 경우
    if (isLoading || name === '' || email === '' || password === '') {
      setError('모든 필드를 채워주세요.');
      return;
    }

    setIsLoading(true);
    setError(''); // 이전 에러 초기화
    try {
      // 1. create an account
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // console.log(credentials.user);
      // 2. set user name
      await updateProfile(credentials.user, {
        displayName: name,
      });
      // 3. redirect to HomePage
      navigate('/');
    } catch (e) {
      // 에러 내역 보여주기
      console.log(e);
      // setError(e)
    } finally {
      setIsLoading(false);
    }
    // console.log(name, email, password);
  };
  return (
    <>
      <Wrapper>
        <Title>CREATE ACCOUNT</Title>
        <Form onSubmit={onSubmit}>
          <Input
            onChange={onChange}
            name="name"
            value={name}
            placeholder="Name"
            type="text"
            required
          />
          <Input
            onChange={onChange}
            name="email"
            value={email}
            placeholder="Email"
            type="email"
            required
          />
          <Input
            onChange={onChange}
            name="password"
            value={password}
            placeholder="Password"
            type="password"
            required
          />
          <Input
            type="submit"
            value={isLoading ? 'Loading...' : 'Create Account'}
          />
        </Form>
        {error !== '' ? <Error>{error}</Error> : null}
      </Wrapper>
    </>
  );
}

export default CreateAccount;
