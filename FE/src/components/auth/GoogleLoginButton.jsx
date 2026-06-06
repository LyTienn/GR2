import { useTranslation } from "react-i18next";
// src/components/auth/GoogleLoginButton.jsx
// Nút "Đăng nhập bằng Google" — dùng window.location.href để redirect
// toàn trang sang Backend, kích hoạt luồng OAuth2.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function GoogleLoginButton({ disabled = false }) {
  const { t } = useTranslation();
  function handleGoogleLogin() {
    // Redirect toàn trang → Backend sẽ redirect tiếp sang Google
    window.location.href = `${API_BASE}/auth/google`;
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled}
      style={styles.button}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
        e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = styles.button.boxShadow;
        e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
      }}
    >
      {/* Google "G" logo SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 48 48"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>

      <span>{t("layout.login.loginGoogle")}</span>
    </button>
  );
}

const styles = {
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#3c4043",
    border: "1px solid #dadce0",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "box-shadow 0.2s, background-color 0.2s",
    fontFamily: "inherit",
  },
  buttonHover: {
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    backgroundColor: "#f8f9fa",
  },
};

export default GoogleLoginButton;