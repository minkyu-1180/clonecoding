import { Outlet } from 'react-router-dom';
function Layout() {
  return (
    <>
      <h2>layout</h2>
      {/* Outlet을 통해 하위 라우터 받기 */}
      <Outlet />
    </>
  );
}

export default Layout;
