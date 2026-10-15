import { createTheme } from "@mui/material/styles";

// アプリ全体で使う色と、MUI のボタンの共通スタイル
const theme = createTheme({
	palette: {
		primary: { main: "#ed6c02", dark: "#e65100", contrastText: "#fff" },
	},
	typography: {
		fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
		button: { textTransform: "none", fontWeight: "bold" },
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: { borderRadius: 8 },
				// MUI 既定の半透明の枠ではなく、文字と同じ色の枠にする
				outlined: { borderColor: "currentColor" },
			},
		},
	},
});

export default theme;
