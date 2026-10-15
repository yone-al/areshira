import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Board.css";
import ErrorScreen from "../Components/ErrorScreen";
import MessageBubble from "../Components/MessageBubble";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";

// ==========================================
// 定数
// ==========================================

/** ヒントに交互に表示するアイコン（京都と大阪） */
const HINT_ICONS = ["/Image/Kyoto.jpg", "/Image/Osaka.jpg"];

// ==========================================
// 型定義
// ==========================================

/** APIレスポンスの形 */
type RoundResponse = {
	round: {
		id: number;
		answer: string;
		hints: string[];
		updated_at: string;
	};
};

// ==========================================
// メインコンポーネント
// ==========================================

function Board() {
	const navigate = useNavigate();

	// URLからラウンドIDを取得（例: /board/12 → id = "12"）
	const { id } = useParams<{ id: string }>();

	// 正解の文字列
	const [answer, setAnswer] = useState("");
	// チャット形式で表示するヒント
	const [hints, setHints] = useState<string[]>([]);
	// ローディング状態
	const [isLoading, setIsLoading] = useState(true);
	// エラー状態
	const [fetchError, setFetchError] = useState(false);
	// 答えの表示/非表示
	const [isAnswerVisible, setIsAnswerVisible] = useState(false);

	// 二重フェッチ防止用
	const hasFetchedRef = useRef(false);

	// ページ表示時にAPIからラウンドデータを取得する
	useEffect(() => {
		// StrictModeでの二重実行を防ぐ
		if (hasFetchedRef.current) return;
		hasFetchedRef.current = true;

		const fetchRoundData = async () => {
			try {
				const response = await fetch(`/api/solo/board/${id}`);
				if (!response.ok) {
					throw new Error(`サーバーエラー: ${response.status}`);
				}
				const data: RoundResponse = await response.json();

				setAnswer(data.round.answer);
				setHints(data.round.hints);
			} catch (error) {
				console.error("ラウンドデータの取得に失敗しました:", error);
				setFetchError(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRoundData();
	}, [id]);

	// ローディング中の表示
	if (isLoading) {
		return <div className="board-loading">読み込み中...</div>;
	}

	if (fetchError) {
		return (
			<ErrorScreen backLabel="一覧に戻る" onBack={() => navigate("/board")} />
		);
	}

	return (
		<div className="board-page-container">
			{/* チャット形式のメッセージ表示エリア */}
			<div className="board-messages">
				{hints.map((hint, index) => (
					<MessageBubble
						// biome-ignore lint/suspicious/noArrayIndexKey: ヒントは並び替えないので index をキーにしてよい
						key={index}
						text={hint}
						isUser={false}
						icon={HINT_ICONS[index % HINT_ICONS.length]}
					/>
				))}
			</div>

			{/* 画面下部の固定バー */}
			<div className="fixed-answer-bar">
				{/* 一覧に戻るボタン */}
				<Button
					variant="outlined"
					onClick={() => navigate("/board")}
					className="square-icon-button back-to-title-btn"
				>
					<ArrowBackIcon fontSize="medium" />
					<span>
						一覧に
						<br />
						戻る
					</span>
				</Button>

				{/* 答えの表示/非表示トグルボタン */}
				<Button
					variant="outlined"
					onClick={() => setIsAnswerVisible(!isAnswerVisible)}
					className={`square-icon-button answer-toggle-btn ${isAnswerVisible ? "visible" : ""}`}
				>
					{isAnswerVisible ? (
						<VisibilityIcon fontSize="medium" />
					) : (
						<HelpOutlineIcon fontSize="medium" />
					)}
					<span>
						{isAnswerVisible ? (
							<>
								答え:
								<br />
								{answer}
							</>
						) : (
							<>
								タップで
								<br />
								答えを確認
							</>
						)}
					</span>
				</Button>
			</div>
		</div>
	);
}

export default Board;
