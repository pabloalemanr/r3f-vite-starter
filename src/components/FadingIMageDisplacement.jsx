import { Html,shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { easing } from "maath";




export const ImageFadeMaterial = shaderMaterial(
  {
    effectFactor: 1.9,
    dispFactor: 0,
    tex: undefined,
    tex2: undefined,
    disp: undefined,
  },
  
  /*glsl*/` varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
      
  /*glsl*/` varying vec2 vUv;
      uniform sampler2D tex;
      uniform sampler2D tex2;
      uniform sampler2D disp;
      uniform float _rot;
      uniform float dispFactor;
      uniform float effectFactor;
      void main() {
        vec2 uv = vUv;
        vec4 disp = texture2D(disp, uv);
        vec2 distortedPosition = vec2(uv.x , uv.y + dispFactor * (disp.r*effectFactor));
        vec2 distortedPosition2 = vec2(uv.x , uv.y - (1.0 - dispFactor) * (disp.r*effectFactor));
        vec4 _texture = texture2D(tex, distortedPosition);
        vec4 _texture2 = texture2D(tex2, distortedPosition2);
        vec4 finalTexture = mix(_texture, _texture2, dispFactor);
        gl_FragColor = finalTexture;
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`
);

extend({ ImageFadeMaterial });

export const FadingImageDisplacement = () => {
  const ref = useRef();
  const [texture1, texture2, dispTexture] = useTexture([
    "/textures/8.jpg",
    "/textures/6.jpg",
    "/textures/8.jpg",
  ]);
  const [clicked, setClicked] = useState(false);
  useFrame((_state, delta) => {
    easing.damp(ref.current, "dispFactor", clicked ? 1: 0, 0.2, delta);
    // ref.current.dispFactor = THREE.MathUtils.lerp(
    //   ref.current.dispFactor,
    //   clicked ? 1 : 0,
    //   0.075
    // );
  });
  
  const handleToggleClick = () => {
    setClicked((prevClicked) => !prevClicked);
  };
  
  
  return (

    <mesh onClick={handleToggleClick}>
       <sphereGeometry args={[500, 60, 40]} /> {/* Usamos una geometría esférica para el fondo 360 */}
      <imageFadeMaterial
        ref={ref}
        tex={texture1}
        tex2={texture2}
        disp={dispTexture}
        toneMapped={false}
        side={THREE.BackSide}
      />
    </mesh>
    
  );
};
