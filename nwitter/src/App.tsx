// Dependencies
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { styled, createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

import { useEffect, useState } from 'react';
// components
import Layout from './components/layout.tsx';
import LoadingScreen from './components/loading-screen.tsx';
import ProtectedRoute from './components/protected-route.tsx';
// routes
import Home from './routes/home.tsx';
import Profile from './routes/profile.tsx';
import CreateAccount from './routes/create-account.tsx';
import Login from './routes/login.tsx';
import { auth } from './firebase.ts';

// router
const router = createBrowserRouter([
  // 기본 router(/ -> Layout)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    // Layout 하위 router
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  // 계정 router
  {
    path: '/create-account',
    element: <CreateAccount />,
  },
  // 로그인 router
  {
    path: '/login',
    element: <Login />,
  },
]);
// global styles
const GlobalStyles = createGlobalStyle`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    background-color: black;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
  }
`;

// Wrapper
const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;
function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const init = async () => {
    // 최초 인증 상태가 완료될 때 시작되는 Promise return
    // Firebase가 쿠키와 토큰을 읽고, 백엔드와 소통해서 로그인 여부 확인
    await auth.authStateReady();
    // firebase 기다리기 위해
    setIsLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  );
}

export default App;
