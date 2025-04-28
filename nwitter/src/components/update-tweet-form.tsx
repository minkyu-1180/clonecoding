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
  photo?: string;
  onClose: () => void;
}
const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;
const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 10px;
`;
const UpdateBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;
const CancelBtn = styled.input`
  background-color: gray;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;
const UpdateFileButton = styled.label`
  margin-top: 10px;
  color: #1d9bf0;
  cursor: pointer;
`;
const UpdateFileInput = styled.input`
  display: none;
`;

const DeleteFileButton = styled.button`
  margin-top: 10px;
  color: #1d9bf0;
  cursor: pointer;
`;
const RestoreFileButton = styled.button`
  margin-top: 10px;
  color: #1d9bf0;
  cursor: pointer;
`;

function UpdateTweetForm({ tweet, userId, id, photo, onClose }: Props) {
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [updatedTweet, setUpdatedTweet] = useState(tweet);
  const [updatedPhoto, setUpdatedPhoto] = useState<string | undefined>(photo);
  const [updatedFile, setUpdatedFile] = useState<File | null>();

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedTweet(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setUpdatedFile(files[0]);
      setUpdatedPhoto(URL.createObjectURL(files[0])); // 새로 선택한 파일의 URL 생성
    } else {
      setUpdatedFile(null);
      setUpdatedPhoto('');
    }
  };

  const onFileRestore = () => {
    setUpdatedFile(null);
    setUpdatedPhoto(photo);
  };
  const onFileDelete = () => {
    setUpdatedFile(null);
    setUpdatedPhoto('');
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !user ||
      user.uid !== userId ||
      isLoading ||
      updatedTweet === '' ||
      updatedTweet.length > 200
    )
      return;

    try {
      setIsLoading(true);

      // 트윗 내용 업데이트
      await updateDoc(doc(db, 'tweets', id), {
        tweet: updatedTweet,
        UpdatedAt: Date.now(),
        photo: null,
      });

      const locationRef = ref(storage, `tweets/${user.uid}/${id}`);

      if (updatedFile) {
        if (updatedPhoto) {
          if (updatedPhoto === photo) {
            return;
          }
          // 새로운 사진 추가 or 기존 사진을 다른 사진으로 수정
          await deleteObject(locationRef);
          const result = await uploadBytes(locationRef, updatedFile);
          const url = await getDownloadURL(result.ref);
          await updateDoc(doc(db, 'tweets', id), {
            photo: url,
          });
        } else {
          return;
        }
      } else {
        if (updatedPhoto) {
          return;
        } else {
          // 기존 사진을 삭제
          await deleteObject(locationRef);
          await updateDoc(doc(db, 'tweets', id), {
            photo: null,
          });
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      onClose();
      setIsLoading(false);
      setUpdatedFile(null);
      setUpdatedTweet('');
      setUpdatedPhoto('');
    }
  };

  const onCancel = () => {
    onClose();
    setUpdatedTweet('');
    setIsLoading(false);
  };

  return (
    <Wrapper onClick={(e) => e.stopPropagation()}>
      <CancelBtn onClick={onCancel} type="button" value="Cancel" />
      <Form onSubmit={onSubmit}>
        {/* 자동으로 커서가 입력창 안에 있도록 */}
        <TextArea
          rows={5}
          maxLength={180}
          onChange={onTextChange}
          value={updatedTweet}
          placeholder={updatedTweet}
          autoFocus
        />
        {photo ? <Photo src={photo} /> : null}

        <UpdateFileButton htmlFor="file">update photo</UpdateFileButton>
        <UpdateFileInput
          onChange={onFileChange}
          type="file"
          id="file"
          accept="image/*"
        />
        <DeleteFileButton onClick={onFileDelete}>
          사진 삭제하기
        </DeleteFileButton>
        <RestoreFileButton onClick={onFileRestore}>
          사진 복원하기
        </RestoreFileButton>
        <UpdateBtn
          type="submit"
          value={isLoading ? 'Updating...' : 'Update Your Tweet'}
        />
      </Form>
    </Wrapper>
  );
}

export default UpdateTweetForm;
