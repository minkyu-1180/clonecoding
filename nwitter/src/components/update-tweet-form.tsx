import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import {
  uploadBytes,
  getDownloadURL,
  ref,
  deleteObject,
} from 'firebase/storage';
import { useState } from 'react';
import styled from 'styled-components';

interface Props {
  tweet: string;
  userId: string;
  id: string;
  photo?: string; // 기존 사진 URL (있거나 없거나)
  onClose: () => void;
}

// 컴포넌트를 감싸는 최상위 div (모달 콘텐츠 영역 역할)
const Wrapper = styled.div`
  background-color: white; /* 모달 배경 색상 */
  padding: 25px;
  border-radius: 10px;
  max-width: 600px; /* 최대 너비 설정 */
  width: 90%; /* 모달 너비 (반응형) */
  position: relative; /* CancelBtn 배치를 위한 기준점 */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Wrapper 내부 요소 간 간격 */
`;

// 취소 버튼 (Wrapper의 오른쪽 상단에 위치)
const CancelBtn = styled.button`
  position: absolute;
  top: 7px;
  right: 7px;
  background-color: tomato;
  border-radius: 15px;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
`;

// 수정할 사항 form
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px; /* 폼 내부 요소 간 간격 */
`;

// 트윗 내용 및 사진/파일 버튼 영역을 담을 메인 컨테이너 (좌우 배치)
const MainContentArea = styled.div`
  display: flex;
  gap: 15px;
  align-items: flex-start; /* 상단 정렬 */
`;

// 사진 미리보기 및 사진 관련 버튼 영역을 담을 컨테이너 (세로 배치)
const PhotoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 120px;
  flex-shrink: 1;
`;

// 수정할 tweet을 작성할 textarea
const TextArea = styled.textarea`
  flex-grow: 1;
  border: 2px solid white;
  padding: 15px;
  border-radius: 10px;
  font-size: 1rem;
  color: white;
  background-color: black;
  resize: none;
  min-height: 170px; /* 최소 높이 설정 (사진 높이와 비슷하게 조정) */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  &::placeholder {
    font-size: 1rem;
    color: gray;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

// 수정하려는 이미지를 보여주는 img 또는 대체 요소 컨테이너
const PhotoContainer = styled.div`
  width: 100px;
  height: 100px;
  border: 1px solid black;
  border-radius: 10px;
  overflow: hidden;
  background-color: #222;
  display: flex;
  justify-content: center;
  align-items: center;
  color: gray;
  box-sizing: border-box;
`;

// 실제 이미지 태그
const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 사진 관련 버튼들을 담을 컨테이너 (세로 배치)
const FileButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
`;

// 새로운 사진을 찾기 위한 버튼 (label)
const UpdateFileButton = styled.label`
  background-color: #333;
  color: white;
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: center; /* 텍스트 중앙 정렬 */
  width: 100px;

  &:hover {
    background-color: #555;
  }
`;

// 새로운 사진을 담아두기 위한 input (숨김)
const UpdateFileInput = styled.input`
  display: none;
`;

// 기존 UpdateFileInput에 담긴 사진을 삭제 버튼
const DeleteFileButton = styled.button`
  background-color: tomato;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  /* 크기 통일을 위한 속성 */
  box-sizing: border-box;
  width: 100px; /* 너비 고정 */

  &:hover {
    opacity: 0.8;
  }
`;

// 수정하기 전 사진을 복원하는 버튼
const RestoreFileButton = styled.button`
  background-color: gray;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  /* 크기 통일을 위한 속성 */
  box-sizing: border-box;
  width: 100px; /* 너비 고정 */

  &:hover {
    opacity: 0.8;
  }
`;

// 트윗과 사진을 Firebase의 storage와 store에 수정
const UpdateBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

function UpdateTweetForm({ tweet, userId, id, photo, onClose }: Props) {
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [updatedTweet, setUpdatedTweet] = useState(tweet);
  // updatedPhoto는 미리보기 URL 또는 원래 photo URL을 담음 (undefined는 사진 없음 상태)
  const [updatedPhoto, setUpdatedPhoto] = useState<string | undefined>(photo);
  // updatedFile은 새로 선택된 File 객체만 담음 (null은 파일 선택 안함)
  const [updatedFile, setUpdatedFile] = useState<File | null>(null);

  // Photo 섹션에 보여줄 URL 결정 (선택된 새 파일 > updatedPhoto)
  // updatedPhoto는 원래 photo prop 또는 URL.createObjectURL 결과
  const photoToDisplay = updatedFile
    ? URL.createObjectURL(updatedFile)
    : updatedPhoto;

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedTweet(e.target.value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      // 파일 크기 제한 (예: 1MB)
      const fileSizeLimit = 1 * 1024 * 1024; // 1MB
      if (file.size > fileSizeLimit) {
        alert(
          `파일 크기가 너무 큽니다. ${
            fileSizeLimit / 1024 / 1024
          }MB 이하의 이미지를 선택해주세요.`
        );
        e.target.value = ''; // 파일 선택 취소
        setUpdatedFile(null);
        // 기존 사진이 있었다면 다시 보여줌 (photo prop 사용)
        setUpdatedPhoto(photo);
        return;
      }
      setUpdatedFile(file);
      // setUpdatedPhoto(URL.createObjectURL(file)); // photoToDisplay 상태 변수 사용으로 불필요
    } else {
      setUpdatedFile(null);
      // 파일 선택을 취소했다면 기존 사진으로 복원 (photo prop 사용)
      setUpdatedPhoto(photo);
    }
  };

  // 사진 복원 함수: updatedFile 초기화, updatedPhoto를 원래 photo URL로 설정
  const onFileRestore = () => {
    setUpdatedFile(null); // 선택된 새 파일 초기화
    setUpdatedPhoto(photo); // original photo URL로 복원
  };

  // 사진 삭제 함수: updatedFile 초기화, updatedPhoto를 undefined로 설정하여 사진 없음 상태로 만듦
  const onFileDelete = () => {
    setUpdatedFile(null); // 선택된 새 파일 초기화
    setUpdatedPhoto(undefined); // 사진 미리보기 제거 (undefined로 설정)
  };

  // 이 부분은 로직이 복잡해 보이므로, UI 구조 요청에 따라 비워둡니다.
  // 실제 업데이트 로직은 별도로 구현해야 합니다.
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || user.uid !== userId || isLoading || updatedTweet.length > 200)
      return;

    // 트윗 내용이 비어있고 사진도 없는 경우 업데이트를 막을지 결정
    if (
      updatedTweet === '' &&
      typeof updatedPhoto === 'undefined' &&
      updatedFile === null
    ) {
      alert('트윗 내용 또는 사진을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const tweetDocRef = doc(db, 'tweets', id);
      const photoRef = ref(storage, `tweets/${user.uid}/${id}`);

      // 1. 사진 변경 처리
      if (updatedFile) {
        // 새로운 파일이 선택됨 (추가 또는 교체)
        // 기존 사진이 Storage에 있다면 삭제 (원래 photo prop이 있다면)
        if (photo) {
          try {
            await deleteObject(photoRef); // Storage에서 기존 사진 삭제 시도
          } catch (storageError) {
            // 기존 사진이 없거나 삭제 실패해도 진행 (새 사진 업로드)
            console.warn(
              'Failed to delete old photo from storage:',
              storageError
            );
          }
        }
        // 새로운 사진 Storage에 업로드
        const result = await uploadBytes(photoRef, updatedFile);
        const newPhotoUrl = await getDownloadURL(result.ref);

        // Firestore 트윗 문서 업데이트 (내용 및 새 사진 URL)
        await updateDoc(tweetDocRef, {
          tweet: updatedTweet,
          photo: newPhotoUrl,
          UpdatedAt: Date.now(),
        });
      } else {
        // 새로운 파일이 선택되지 않음 (기존 사진 유지 또는 삭제)
        // updatedFile은 null이고 updatedPhoto가 undefined이면 = 사진 삭제 의도 (onFileDelete 호출 시 발생)
        if (typeof updatedPhoto === 'undefined' && photo) {
          // updatedPhoto가 undefined이고 원래 photo가 있었다면
          // Storage에서 기존 사진 삭제
          try {
            await deleteObject(photoRef);
          } catch (storageError) {
            console.warn(
              'Failed to delete old photo from storage:',
              storageError
            );
          }
          // Firestore 트윗 문서 업데이트 (내용 및 photo 필드 null로 설정)
          await updateDoc(tweetDocRef, {
            tweet: updatedTweet,
            photo: null,
            UpdatedAt: Date.now(),
          });
        } else if (updatedPhoto === photo) {
          // updatedFile은 null이고 updatedPhoto가 원래 photo와 같으면 = 사진 변경 없음
          // Firestore 트윗 문서 업데이트 (내용만)
          await updateDoc(tweetDocRef, {
            tweet: updatedTweet,
            // photo 필드는 변경하지 않음 (원래 값 유지)
            UpdatedAt: Date.now(),
          });
        }
        // 그 외의 경우 (원래 사진이 없었고, 새 파일도 선택 안 했으며, 삭제도 안 한 경우)
        // -> updatedFile === null && typeof updatedPhoto === 'undefined' && !photo
        // 이 경우는 초기 상태 그대로이므로 Firestore 업데이트 불필요 (로직상 위 조건문에 포함되지 않음)
      }

      onClose(); // 성공 시 모달 닫기
    } catch (e) {
      console.error('Tweet update failed:', e);
      alert('트윗 업데이트 중 오류가 발생했습니다.'); // 사용자에게 오류 알림
    } finally {
      setIsLoading(false);
      // 모달이 닫히므로 상태 초기화는 onClose 이후에 발생할 것입니다.
      // 여기서는 업데이트 완료 후 로딩 상태만 해제합니다.
    }
  };

  const onCancel = () => {
    onClose(); // 취소 시 모달 닫기
    // 취소 시 상태 초기화는 모달이 닫히면서 자연스럽게 이루어지거나, 필요에 따라 추가
  };

  return (
    <Wrapper onClick={(e) => e.stopPropagation()}>
      {/* 취소 버튼은 Wrapper에 직접 배치 */}
      <CancelBtn onClick={onCancel} type="button">
        X
      </CancelBtn>

      <Form onSubmit={onSubmit}>
        <MainContentArea>
          {' '}
          {/* TextArea와 PhotoSection을 좌우로 배치 */}
          <TextArea
            rows={5}
            maxLength={180}
            onChange={onTextChange}
            value={updatedTweet}
            placeholder={tweet} /* 원래 트윗 내용을 placeholder로 사용 */
            autoFocus
          />
          <PhotoSection>
            {' '}
            {/* PhotoContainer와 FileButtonContainer를 세로로 배치 */}
            {/* 사진 미리보기 영역 */}
            <PhotoContainer>
              {photoToDisplay ? (
                <Photo src={photoToDisplay} alt="Current tweet photo" />
              ) : (
                <span>No Photo</span> // 사진 없을 때 표시
              )}
            </PhotoContainer>
            {/* 사진 관련 버튼 그룹 */}
            <FileButtonContainer>
              <UpdateFileButton htmlFor={`file-update-${id}`}>
                {' '}
                {/* 고유 ID 사용 */}
                사진 변경
              </UpdateFileButton>
              <UpdateFileInput
                onChange={onFileChange}
                type="file"
                id={`file-update-${id}`}
                accept="image/*"
              />
              {/* photoToDisplay가 있을 때만 사진 삭제 버튼 표시 */}
              {photoToDisplay && ( // photoToDisplay는 새 파일 선택 시 URL.createObjectURL 결과 또는 원래 photo URL
                <DeleteFileButton onClick={onFileDelete} type="button">
                  사진 삭제
                </DeleteFileButton>
              )}
              {/* photo (원본 사진)가 있고 photoToDisplay가 없을 때만 복원 버튼 표시 */}
              {photo &&
                !photoToDisplay && ( // photo prop은 있고 photoToDisplay가 없을 때만 복원 버튼 표시
                  <RestoreFileButton onClick={onFileRestore} type="button">
                    사진 복원
                  </RestoreFileButton>
                )}
            </FileButtonContainer>
          </PhotoSection>
        </MainContentArea>

        {/* 업데이트 버튼 */}
        <UpdateBtn
          type="submit"
          value={isLoading ? 'Updating...' : 'Update Your Tweet'}
          disabled={
            isLoading ||
            (updatedTweet === '' &&
              typeof updatedPhoto === 'undefined' &&
              updatedFile === null)
          } /* 로딩 중이거나 내용/사진 없을 때 비활성화 */
        />
      </Form>
    </Wrapper>
  );
}

export default UpdateTweetForm;
