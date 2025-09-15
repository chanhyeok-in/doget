
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton, XR } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import './App.css';

const STABILITY_API_KEY = 'sk-oya8jwzNifWb3J9e3jZREo80UEog5bJVTtaQQ7Jsw1EAA9T9';
// 최신 v2 API 주소로 변경
const IMAGE_TO_IMAGE_URL = 'https://api.stability.ai/v2/stable-image/generate/core';
const MIN_PIXELS = 262144; // 512x512

function PetImage({ textureUrl }) {
  const texture = useTexture(textureUrl);
  return (
    <mesh position={[0, 0.5, -1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedTexture, setGeneratedTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width * img.height < MIN_PIXELS) {
          setError(`이미지가 너무 작습니다. 512x512 픽셀 이상의 사진을 올려주세요.`);
          setFile(null);
        } else {
          setFile(selectedFile);
          setError(null);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleGenerateImage = async () => {
    if (!file) {
      setError('반려동물 사진을 먼저 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    // v2 API 파라미터 이름으로 변경 (init_image -> image, text_prompts -> prompt)
    formData.append('image', file);
    formData.append('prompt', prompt || 'A cute pet');
    formData.append('strength', 0.6);
    formData.append('output_format', 'jpeg'); // jpeg으로 변경하여 응답 속도 개선

    try {
      const response = await fetch(IMAGE_TO_IMAGE_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json', // v2는 application/json 또는 image/*
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.errors ? errorData.errors[0] : (errorData.message || `API 요청 실패: ${response.statusText}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // v2 API 응답 구조에 맞게 변경 (artifacts[0].base64 -> image)
      const base64Image = data.image;
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
      setGeneratedTexture(imageUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ARButton />
      <Canvas>
        <XR>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          {generatedTexture ? (
            <PetImage textureUrl={generatedTexture} />
          ) : (
            <mesh position={[0, 0.5, -1]}>
              <boxGeometry />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          )}
        </XR>
      </Canvas>
      <div className="container on-top">
        <h1>🐾 AR Pet Memorial</h1>
        {error && <p className="error-message">오류: {error}</p>}
        <div className="form-group">
          <label>1. 반려동물 사진 (512x512 이상)</label>
          <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
        </div>
        <div className="form-group">
          <label>2. 어떤 모습을 보고 싶나요?</label>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 활짝 웃는 모습, 잠자는 모습" 
          />
        </div>
        <button onClick={handleGenerateImage} disabled={isLoading || !file}>
          {isLoading ? '이미지 생성 중...' : '이미지 생성하기'}
        </button>
      </div>
    </>
  );
}

export default App;
