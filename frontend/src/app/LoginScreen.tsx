import { useEffect, useState, type FormEvent } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ApiError } from "../api/http";
import { showEnDialog } from "../widgets/EnDialogService";
import { useApp } from "./AppContext";
import "./LoginScreen.css";

export function LoginScreen() {
  const { login } = useApp();
  const [cdCom, setCdCom] = useState("");
  const [cdUser, setCdUser] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("enotes.login");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCdCom(parsed.cdCom ?? "");
        setCdUser(parsed.cdUser ?? "");
      }
    } catch {
      // ignore parse errors or storage unavailable
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!cdCom.trim() || !cdUser.trim() || !password) {
      await showEnDialog(
        "error",
        "Company code, user code, and password are all required.",
      );
      return;
    }
    setBusy(true);
    try {
      await login(cdCom.trim(), cdUser.trim(), password);
      try {
        localStorage.setItem(
          "enotes.login",
          JSON.stringify({ cdCom: cdCom.trim(), cdUser: cdUser.trim() }),
        );
      } catch {
        // localStorage unavailable
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error instanceof ApiError) {
        await showEnDialog("error", error.message);
      } else {
        await showEnDialog(
          "error",
          "Could not reach the ENOTES API. Check that the server is running.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-screen">
      <aside className="login-brand-panel" aria-label="About ENOTES">
        <a className="login-brand" href="/" aria-label="ENOTES home">
          <span className="login-brand-mark" aria-hidden="true">
            e
          </span>
          <span>ENOTES</span>
        </a>

        <div className="login-brand-copy">
          <h2>Business, in good order.</h2>
          <p>A clear place for the everyday work behind your business.</p>
        </div>

        <p className="login-brand-footnote">
          One workspace for the way your business runs.
        </p>
      </aside>

      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-content">
          <a className="login-mobile-brand" href="/" aria-label="ENOTES home">
            <span className="login-brand-mark" aria-hidden="true">
              e
            </span>
            <span>ENOTES</span>
          </a>
          <h1 id="login-title">Sign in to ENOTES</h1>
          <p className="login-intro">
            Enter your company and user codes to continue.
          </p>

          <form className="login-form" onSubmit={submit} noValidate>
            <TextField
              className="login-field"
              name="cdCom"
              label="Company code"
              value={cdCom}
              onChange={(event) => setCdCom(event.target.value)}
              autoComplete="organization"
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessOutlined aria-hidden="true" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              className="login-field"
              name="cdUser"
              label="User code"
              value={cdUser}
              onChange={(event) => setCdUser(event.target.value)}
              autoComplete="username"
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined aria-hidden="true" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              className="login-field"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined aria-hidden="true" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((visible) => !visible)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              className="login-submit"
              type="submit"
              variant="contained"
              fullWidth
              disabled={busy}
              startIcon={
                busy ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="login-help">
            Need access? Contact your company administrator.
          </p>
        </div>
        <p className="login-footer">ENOTES business management</p>
      </section>
    </main>
  );
}
