import { styled } from 'styled-components';
import { auth, db, storage } from '../firebase';
import { useState, useEffect } from 'react';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import {
  collection,
  onSnapshot,
  where,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';

import { updateProfile } from 'firebase/auth';
import Tweet from '../components/tweet';
import { ITweet } from '../components/timeline';
import { Unsubscribe } from 'firebase/auth';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
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

// 이름 수정 관련 스타일 추가
const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; /* 이름과 버튼 사이 간격 */
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
  gap: 10px; /* 버튼들 사이 간격 */
`;

const SaveButton = styled(EditButton)`
  background-color: #1abc9c; /* 저장 버튼 색상 */
`;

const CancelButton = styled(EditButton)`
  background-color: #e74c3c; /* 취소 버튼 색상 */
`;
const TweetWrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
  max-height: 400px; /* 예시: 최대 높이를 400px로 설정 */
  /* 또는 height: 100%; 같은 명시적인 높이 설정 (부모 요소에 따라 조정 필요) */

  /* 스크롤바 디자인을 원하시면 추가 */
  &::-webkit-scrollbar {
    gap: 2px;
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: pink;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
`;

function Profile() {
  const user = auth.currentUser;
  const [avatarPhoto, setAvatarPhoto] = useState(user?.photoURL);
  const [avatarName, setAvatarName] = useState(
    user?.displayName || 'Anonymous'
  );
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [newName, setNewName] = useState(avatarName); // 입력 필드에 사용할 새 이름 상태
  const [tweets, setTweets] = useState<ITweet[]>([]);

  let unsubscribe: Unsubscribe | null = null;

  const fetchTweets = async () => {
    const tweetsQuery = query(
      collection(db, 'tweets'),
      where('userId', '==', user?.uid),
      orderBy('createdAt', 'desc'),
      limit(25)
    );

    // onSnapshot을 통해 실시간 DB 연동
    unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
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

  // 사용자 이름 변경 시 입력 필드 값 업데이트
  useEffect(() => {
    setNewName(avatarName);
    fetchTweets();
    return () => {
      // 언마운트 된 경우
      unsubscribe && unsubscribe();
    };
  }, [avatarName]);

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
      {/* 이름 표시 또는 입력 필드 조건부 렌더링 */}
      <NameContainer>
        {isEditing ? (
          <>
            <NameInput
              type="text"
              value={newName}
              onChange={onNewNameChange}
              placeholder={avatarName} // placeholder는 기존 이름으로 설정
            />
            <ButtonContainer>
              <SaveButton onClick={onSaveClick}>수정</SaveButton>{' '}
              {/* 수정 완료 버튼 */}
              <CancelButton onClick={onCancelClick}>취소</CancelButton>{' '}
              {/* 수정 취소 버튼 */}
            </ButtonContainer>
          </>
        ) : (
          <>
            <Name>{avatarName}</Name>
            <ButtonContainer>
              <EditButton onClick={onEditClick}>수정하기</EditButton>{' '}
            </ButtonContainer>
          </>
        )}
      </NameContainer>
      <TweetWrapper>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </TweetWrapper>
    </Wrapper>
  );
}

export default Profile;
