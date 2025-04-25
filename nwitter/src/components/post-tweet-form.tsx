import { styled } from 'styled-components';
import { useState } from 'react';
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
  return (
    <Wrapper>
      <Form>
        <TextArea
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
