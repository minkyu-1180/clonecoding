// component
import PostTweetForm from '../components/post-tweet-form.tsx';
import TimeLine from '../components/timeline.tsx';
// styled-components
import { styled } from 'styled-components';
const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll;
  grid-template-rows: 1fr 5fr;
`;

function Home() {
  return (
    <Wrapper>
      <PostTweetForm />
      <TimeLine />
    </Wrapper>
  );
}
export default Home;
