export default function BaseLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5"
      }}
    >
      <main
        style={{
          flex: 1,
          padding: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%"
        }}
      >
        {children}
      </main>
    </div>
  );
}
