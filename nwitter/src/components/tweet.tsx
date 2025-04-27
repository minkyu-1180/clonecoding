import { auth, db, storage } from '../firebase.ts';
import { doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { styled } from 'styled-components';
import { ITweet } from './timeline';
import { deleteDoc } from 'firebase/firestore';
import UpdateTweetForm from './update-tweet-form.tsx';
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  position: relative;
`;

const Column = styled.div`
  &:last-child {
    place-self: end;
  }
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const onUpdate = async () => {
    if (user?.uid !== userId) {
      return;
    }
  };
  const onDelete = async () => {
    // 로그인 하지 않았거나, 해당 트윗 작성자가 로그인 유저가 아닐 경우
    if (user?.uid !== userId) {
      return;
    }
    const flag = confirm('Are You Sure to Delete This Tweet?');
    if (!flag) {
      return;
    }

    try {
      // 해당 document 삭제
      await deleteDoc(doc(db, 'tweets', id));
      // 해당 document에 첨부한 이미지가 있는지 확인
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
      {user?.uid === userId ? (
        <DeleteButton onClick={onDelete}>X</DeleteButton>
      ) : null}
    </Wrapper>
  );
}
