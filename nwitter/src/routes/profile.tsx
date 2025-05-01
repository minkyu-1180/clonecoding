import { styled } from 'styled-components';
import { auth, db, storage } from '../firebase';
import { useState, useEffect } from 'react';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import {
  onSnapshot,
  collection,
  where,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { Unsubscribe } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import Tweet from '../components/tweet';
import { ITweet } from '../components/timeline';

// 전체 레이아웃을 위한 Grid Wrapper
const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll;
  grid-template-rows: 1fr 5fr;
`;

// 프로필 정보들을 감싸는 컨테이너 (기존 Wrapper의 내용물을 여기에 담음)
const ProfileInfoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px; /* 내부 요소들 간 간격 */
  /* grid 첫 번째 행에 위치 */
`;

const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  svg {
    width: 50px;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NameInput = styled.input`
  font-size: 22px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const EditButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    opacity: 0.9;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const SaveButton = styled(EditButton)`
  background-color: #1abc9c;
`;

const CancelButton = styled(EditButton)`
  background-color: #e74c3c;
`;

// 트윗 목록을 감싸는 컨테이너
const TweetWrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  /* 너비 고정 (필요하다면 유지, 아니면 삭제) */
  /* width: 600px; */
  /* max-width: 600px; */

  /* Grid 컨테이너의 1fr 높이를 채우고 내용 넘칠 시 스크롤 */
  overflow-y: scroll;
  /* height 또는 max-height 속성은 더 이상 필요 없습니다. */

  /* 스크롤바 스타일 (선택 사항) */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;
// const Wrapper = styled.div`
//   display: flex;
//   align-items: center;
//   flex-direction: column;
//   gap: 20px;
// `;
// const AvatarUpload = styled.label`
//   width: 80px;
//   overflow: hidden;
//   height: 80px;
//   border-radius: 50%;
//   background-color: #1d9bf0;
//   cursor: pointer;
//   display: flex;
//   justify-content: center;
//   svg {
//     width: 50px;
//   }
// `;
// const AvatarImg = styled.img`
//   width: 100%;
// `;
// const AvatarInput = styled.input`
//   display: none;
// `;
// const Name = styled.span`
//   font-size: 22px;
// `;

// // 이름 수정 관련 스타일 추가
// const NameContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 10px; /* 이름과 버튼 사이 간격 */
// `;

// const NameInput = styled.input`
//   font-size: 22px;
//   padding: 5px;
//   border: 1px solid #ccc;
//   border-radius: 5px;
// `;

// const EditButton = styled.button`
//   background-color: #1d9bf0;
//   color: white;
//   border: none;
//   padding: 5px 10px;
//   border-radius: 5px;
//   cursor: pointer;
//   font-size: 14px;
//   &:hover {
//     opacity: 0.9;
//   }
// `;

// const ButtonContainer = styled.div`
//   display: flex;
//   gap: 10px; /* 버튼들 사이 간격 */
// `;

// const SaveButton = styled(EditButton)`
//   background-color: #1abc9c; /* 저장 버튼 색상 */
// `;

// const CancelButton = styled(EditButton)`
//   background-color: #e74c3c; /* 취소 버튼 색상 */
// `;
// const TweetWrapper = styled.div`
//   display: flex;
//   gap: 10px;
//   flex-direction: column;
//   width: 600px;
//   overflow-y: scroll;
// `;

function Profile() {
  const user = auth.currentUser;
  const [avatarPhoto, setAvatarPhoto] = useState(user?.photoURL);
  const [avatarName, setAvatarName] = useState(
    user?.displayName || 'Anonymous'
  );
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [newName, setNewName] = useState(avatarName); // 입력 필드에 사용할 새 이름 상태
  const [tweets, setTweets] = useState<ITweet[]>([]);
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const fetchTweets = async () => {
      const tweetsQuery = query(
        collection(db, 'tweets'),
        orderBy('createdAt', 'desc'),
        where('userId', '==', user?.uid),
        limit(25)
      );

      // onSnapshot을 통해 실시간 DB 연동
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
        const tweets = snapshot.docs.map((doc) => {
          const { tweet, createdAt, userId, username, photo } = doc.data();
          return {
            tweet,
            createdAt,
            userId,
            username,
            photo,
            id: doc.id,
          };
        });
        setTweets(tweets);
      });
    };

    fetchTweets();
    return () => {
      // 언마운트 된 경우
      unsubscribe && unsubscribe();
    };
  }, []);

  // 이름 입력 필드 값 변경 핸들러
  const onNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  // 수정 시도 버튼 클릭 핸들러
  const onEditClick = () => {
    setIsEditing(true); // 수정 모드로 전환
    setNewName(avatarName); // 입력 필드에 현재 이름으로 초기화
  };

  // 저장 버튼 클릭 핸들러
  const onSaveClick = async () => {
    if (!user || newName === avatarName) {
      setIsEditing(false); // 이름 변경 없으면 수정 모드 해제만
      return;
    }
    try {
      await updateProfile(user, { displayName: newName });
      setAvatarName(newName); // 상태 업데이트
      setIsEditing(false); // 수정 모드 해제
    } catch (e) {
      console.error('Error updating profile: ', e);
      // 에러 처리 (예: 사용자에게 알림)
    }
  };

  // 취소 버튼 클릭 핸들러
  const onCancelClick = () => {
    setIsEditing(false); // 수정 모드 해제
    setNewName(avatarName); // 입력 필드 값을 원래 이름으로 되돌림 (선택 사항)
  };

  const onAvatarPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = e.target;
    if (!user) {
      return;
    }
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      try {
        const result = await uploadBytes(locationRef, file);
        const avatarUrl = await getDownloadURL(result.ref);
        setAvatarPhoto(avatarUrl);
        await updateProfile(user, {
          photoURL: avatarUrl,
        });
      } catch (e) {
        console.error('Error uploading avatar: ', e);
        // 에러 처리 (예: 사용자에게 알림)
      }
    }
  };

  return (
    <Wrapper>
      <ProfileInfoContainer>
        <AvatarUpload htmlFor="avatar">
          {avatarPhoto ? (
            <AvatarImg src={avatarPhoto} />
          ) : (
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
          )}
        </AvatarUpload>
        <AvatarInput
          onChange={onAvatarPhotoChange}
          id="avatar"
          type="file"
          accept="image/*"
        />
        <NameContainer>
          {isEditing ? (
            <>
              <NameInput
                type="text"
                value={newName}
                onChange={onNewNameChange}
                placeholder={avatarName}
              />
              <ButtonContainer>
                <SaveButton onClick={onSaveClick}>수정</SaveButton>
                <CancelButton onClick={onCancelClick}>취소</CancelButton>
              </ButtonContainer>
            </>
          ) : (
            <>
              <Name>{avatarName}</Name>
              <ButtonContainer>
                <EditButton onClick={onEditClick}>수정하기</EditButton>
              </ButtonContainer>
            </>
          )}
        </NameContainer>
      </ProfileInfoContainer>

      {/* 두 번째 행: 트윗 타임라인 영역 */}
      <TweetWrapper>
        {' '}
        {/* Grid의 1fr 높이를 할당받고 자체 스크롤 */}
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </TweetWrapper>
    </Wrapper>
  );
}

// <AvatarUpload htmlFor="avatar">
//   {avatarPhoto ? (
//     <AvatarImg src={avatarPhoto} />
//   ) : (
//     <svg
//       fill="currentColor"
//       viewBox="0 0 20 20"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//     >
//       <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
//     </svg>
//   )}
// </AvatarUpload>
// <AvatarInput
//   onChange={onAvatarPhotoChange}
//   id="avatar"
//   type="file"
//   accept="image/*"
// />
// {/* 이름 표시 또는 입력 필드 조건부 렌더링 */}
// <NameContainer>
//   {isEditing ? (
//     <>
//       <NameInput
//         type="text"
//         value={newName}
//         onChange={onNewNameChange}
//         placeholder={avatarName} // placeholder는 기존 이름으로 설정
//       />
//       <ButtonContainer>
//         <SaveButton onClick={onSaveClick}>수정</SaveButton>{' '}
//         {/* 수정 완료 버튼 */}
//         <CancelButton onClick={onCancelClick}>취소</CancelButton>{' '}
//         {/* 수정 취소 버튼 */}
//       </ButtonContainer>
//     </>
//   ) : (
//     <>
//       <Name>{avatarName}</Name>
//       <ButtonContainer>
//         <EditButton onClick={onEditClick}>수정하기</EditButton>{' '}
//       </ButtonContainer>
//     </>
//   )}
// </NameContainer>
// <TweetWrapper>
//   {tweets.map((tweet) => (
//     <Tweet key={tweet.id} {...tweet} />
//   ))}
// </TweetWrapper>
export default Profile;
