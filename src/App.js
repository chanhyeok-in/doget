import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton, XR } from '@react-three/xr';
// Box import를 제거했습니다.
// import { Box } from '@react-three/drei'; 
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');

  return (
    <>
      <ARButton />
      <Canvas>
        <XR>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          {/* Box 컴포넌트를 기본 mesh와 boxGeometry로 교체했습니다. */}
          <mesh position={[0, 0.5, -1]}>
            <boxGeometry />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </XR>
      </Canvas>
      <div className="container on-top">
        <h1>🐾 AR Pet Memorial</h1>
        <p>떠난 반려동물의 모습을 AR로 다시 만나보세요.</p>
        <div className="form-group">
          <label>반려동물 사진</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label>어떤 모습을 보고 싶나요?</label>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 활짝 웃는 모습, 잠자는 모습" 
          />
        </div>
        <button>이미지 생성하기</button>
      </div>
    </>
  );
}

export default App;