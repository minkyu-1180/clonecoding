import { styled } from 'styled-components';
import { useState } from 'react';
// firebase
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { auth, db, storage } from '../firebase.ts';
const Wrapper = styled.div``;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
      sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const AttatchFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttatchFileInput = styled.input`
  display: none;
`;

const SubmitButton = styled.input`
  padding: 10px 0px;
  background-color: #1d9bf0;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.7;
  }
`;
function PostTweetForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tweet, setTweet] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTweet(e.target.value);
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e?.target;
    if (files && files.length == 1) {
      setFile(files[0]);
    }
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    // console.log(user);
    if (!user || isLoading || tweet === '' || tweet.length > 200) {
      return;
    }
    try {
      setIsLoading(true);

      // db의 tweets 컬렉션에 Document(Data) 추가
      const doc = await addDoc(collection(db, 'tweets'), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || 'Anonymous',
        photo: null,
        userId: user.uid,
      });
      if (file) {
        // Storage의 tweets 폴더의 각 user.uid 별로 트윗 id에 업로드한 파일이 담기게 될 거임
        const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
        console.log(locationRef);
        // 해당 location에 해당 file을 Byte 단위로 업로드한다
        const result = await uploadBytes(locationRef, file);
        console.log(result);
        // 해당 업로드 결과 url(이미지 저장 url)
        const url = await getDownloadURL(result.ref);
        console.log(url);
        // document에 photo가 있기 때문에, url
        updateDoc(doc, {
          photo: url,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={onSubmit}>
        <TextArea
          required
          rows={5}
          maxLength={200}
          onChange={onTextChange}
          value={tweet}
          placeholder="Tweet Your Happening!"
        />
        <AttatchFileButton htmlFor="file">
          {file ? 'Photo Added' : 'Add Photo'}
        </AttatchFileButton>
        <AttatchFileInput
          onChange={onFileChange}
          type="file"
          id="file"
          accept="image/*"
        />
        <SubmitButton
          type="submit"
          value={isLoading ? 'Posting...' : 'Post Tweet'}
        />
      </Form>
    </Wrapper>
  );
}

export default PostTweetForm;
