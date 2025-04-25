import { Outlet } from 'react-router-dom';
import { styled } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase.ts';
// styled components
const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 4fr;
  padding: 50px 0px;
  width: 100%;
  max-width: 860px;
  height: 100%;
`;
const Menu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const MenuItem = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  svg {
    width: 30px;
    fill: white;
  }
  &.log-out {
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  left: 60px;
  background-color: pink;
  color: white;
  border-radius: 5px;
  padding: 5px;
  transition: opacity 0.2s;
  white-space: nowrap;
`;
function Layout() {
  const navigate = useNavigate();
  const logOut = async () => {
    const flag = confirm('Are You Sure To Log Out?');
    if (flag) {
      await auth.signOut();
      navigate('/login');
    }
  };
  return (
    <Wrapper>
      <Menu>
        {/* home 아이콘 */}
        <Link to="/">
          <MenuItem>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
              />
            </svg>
            <Tooltip className="tooltip">Home</Tooltip>
          </MenuItem>
        </Link>
        <Link to="/profile">
          <MenuItem>
            {/* profile 아이콘 */}
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
            <Tooltip className="tooltip">Profile</Tooltip>
          </MenuItem>
        </Link>
        {/* 로그아웃 아이콘 */}
        <MenuItem className="log-out" onClick={logOut}>
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
            />
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
            />
          </svg>
          <Tooltip className="tooltip">Log Out</Tooltip>
        </MenuItem>
      </Menu>
      <Outlet />
    </Wrapper>
  );
}

export default Layout;
