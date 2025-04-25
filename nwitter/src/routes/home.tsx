// component
import PostTweetForm from '../components/post-tweet-form.tsx';
// styled-components
import { styled } from 'styled-components';
const Wrapper = styled.div``;
function Home() {
  return (
    <Wrapper>
      <PostTweetForm />
    </Wrapper>
  );
}
export default Home;
