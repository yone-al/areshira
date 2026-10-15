import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import theme from "./theme.ts";
import App from "./App.tsx";
import Solo from "./Solo/index.tsx";
import BoardList from "./Board/BoardList.tsx";
import Board from "./Board/index.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
	<StrictMode>
		{/* injectFirst: MUI のスタイルを先に読み込み、各画面の CSS で上書きできるようにする */}
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<BrowserRouter>
					<Routes>
						{/* localhost:5173 */}
						<Route path="/" element={<App />} />
						{/* localhost:5173/solo */}
						<Route path="/solo" element={<Solo />} />
						{/* localhost:5173/board（一覧ページ） */}
						<Route path="/board" element={<BoardList />} />
						{/* localhost:5173/board/12（詳細ページ） */}
						<Route path="/board/:id" element={<Board />} />
					</Routes>
				</BrowserRouter>
			</ThemeProvider>
		</StyledEngineProvider>
	</StrictMode>,
);
