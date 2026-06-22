import Svg, { Circle, Path } from "react-native-svg";

type PlantLogoProps = {
  size?: number;
};

export function PlantLogo({ size = 72 }: PlantLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Circle cx="36" cy="36" r="34" fill="#0B3D2E" />
      <Path
        d="M22 44h28l-3 12H25l-3-12Z"
        fill="#20A66B"
      />
      <Path
        d="M36 43V27"
        stroke="#F5F7F6"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M36 31c-8-1-13-6-14-14 9 0 14 5 14 14Z"
        fill="#B7E4CB"
      />
      <Path
        d="M37 34c8-1 13-6 14-14-9 0-14 5-14 14Z"
        fill="#2F6FED"
      />
      <Path
        d="M29 57h14"
        stroke="#F5F7F6"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
