import bgImage from "../assets/background.png"; // adjust path if needed

export default function ShaderBackground({ children }) {
  return (
    <div
      className="h-full w-full bg-black relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
