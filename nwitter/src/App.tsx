// Dependencies
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';
import { useEffect, useState } from 'react';

// components
import Layout from './components/layout.tsx';
// routes
import LoadingScreen from './components/loading-screen.tsx';
import Home from './routes/home.tsx';
import Profile from './routes/profile.tsx';
import CreateAccount from './routes/create-account.tsx';
import Login from './routes/login.tsx';

// router
const router = createBrowserRouter([
  // 기본 router(/ -> Layout)
  {
    path: '/',
    element: <Layout />,
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
function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const init = async () => {
    // firebase 기다리기 위해
    setIsLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </>
  );
}

export default App;
