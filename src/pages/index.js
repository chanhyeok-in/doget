import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton, XR } from '@react-three/xr';
import { useTexture, OrbitControls } from '@react-three/drei';

const PROXY_SERVER_URL = '/api/generate';
const MIN_PIXELS = 262144; // 512x512

function PetImage({ textureUrl }) {
  const texture = useTexture(textureUrl);
  return (
    <mesh position={[0, 0.5, -1]}>
      <boxGeometry args={[1, 1, 0.05]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  );
}

function HomePage() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedTexture, setGeneratedTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isArSupported, setIsArSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(setIsArSupported);
    }
  }, []);

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
    formData.append('image', file);
    formData.append('prompt', prompt);

    try {
      const response = await fetch(PROXY_SERVER_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors ? data.errors[0] : '알 수 없는 오류가 발생했습니다.');
      }

      const base64Image = data.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;
      setGeneratedTexture(imageUrl);
      setRenderKey(prevKey => prevKey + 1);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sceneContent = (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {generatedTexture ? (
        <Suspense fallback={null}>
          <PetImage textureUrl={generatedTexture} />
        </Suspense>
      ) : (
        <mesh position={[0, 0.5, -1]}>
          <boxGeometry />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      )}
    </>
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {isArSupported ? (
        <>
          <ARButton />
          <Canvas>
            <XR key={renderKey}>{sceneContent}</XR>
          </Canvas>
        </>
      ) : (
        <Canvas>
          {sceneContent}
          <OrbitControls />
        </Canvas>
      )}

      {!generatedTexture ? (
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
      ) : (
        <button
          onClick={() => setGeneratedTexture(null)}
          className="ar-button"
          style={{ bottom: '100px' }}
        >
          다시 만들기
        </button>
      )}
    </div>
  );
}

export default HomePage;
