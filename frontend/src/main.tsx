import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './app/App'

const enotesTheme = createTheme({
  palette: {
    primary: { main: '#0056ff', dark: '#064bd4', light: '#6e9bff' },
    secondary: { main: '#2277ff', dark: '#155ed4', light: '#e3e7fc' },
  },
  typography: { fontFamily: '"DM Sans", "Segoe UI", sans-serif' },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is refetched on window refocus by default; keep retry modest.
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={enotesTheme}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
