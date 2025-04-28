import { auth, db, storage } from '../firebase.ts';
import { doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { styled } from 'styled-components';
import { ITweet } from './timeline';
import { deleteDoc } from 'firebase/firestore';
import { useState } from 'react';
import ReactDOM from 'react-dom'; // ReactDOM import

// import UpdateTweetForm from './update-tweet-form.tsx';
import UpdateTweetForm from './update-tweet-form copy.tsx';

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
const ButtonWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
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
`;
const UpdateButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* 반투명 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 다른 요소 위에 오도록 z-index 설정 */
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const user = auth.currentUser;

  const openUpdateModal = () => {
    if (user?.uid !== userId) {
      return;
    }
    setIsModalOpen(true);
  };
  const closeUpdateModal = () => {
    setIsModalOpen(false);
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

  const modalRoot = document.body;

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
      {user?.uid === userId ? (
        <ButtonWrapper>
          <DeleteButton onClick={onDelete}>X</DeleteButton>
          <UpdateButton onClick={openUpdateModal}>Edit</UpdateButton>
        </ButtonWrapper>
      ) : null}

      {isModalOpen && modalRoot
        ? ReactDOM.createPortal(
            <ModalOverlay onClick={(e) => e.stopPropagation()}>
              <UpdateTweetForm
                tweet={tweet}
                userId={userId}
                id={id}
                photo={photo}
                onClose={closeUpdateModal}
              />
            </ModalOverlay>,
            modalRoot
          )
        : null}
    </Wrapper>
  );
}
