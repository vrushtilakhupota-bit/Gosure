import logo from '../assets/gosure-logo.png';

export default function Logo({ size = 64 }: { size?: number }) {
  return <img src={logo} alt="GoSure" className="object-contain" style={{ width: size, height: size }} />;
}
