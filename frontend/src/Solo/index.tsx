import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultButtons from "../Result/Components/ResultButtons";
import ResultOverlay from "../Result/Components/ResultOverlay";
import ShareModal from "../Result/Components/ShareModal";
import InputArea from "./Components/InputArea";
import MessageBubble from "../Components/MessageBubble";
import Timer from "./Components/Timer";
import "./Solo.css";

const KYOTO_ICON = "/Image/Kyoto.jpg";
const OSAKA_ICON = "/Image/Osaka.jpg";
const HINT_ICONS = [KYOTO_ICON, OSAKA_ICON];

// 次のヒントが出るまでの秒数
const HINT_INTERVAL_SEC = 10;

// 読み込み中に順番に表示する関西あるある
const LOADING_MESSAGES = [
	"エスカレーターは右側に立つ",
	"「行けたら行く」は行かない",
	"アメを「アメちゃん」と言う",
	"一家に一台たこ焼き器がある",
	"語尾に「知らんけど」を添える",
	"マクドナルドを「マクド」と言う",
	"「自分」と言って相手を指す",
	"会話のノリがテレビ並み",
	"ナイトスクープは欠かさず見る",
];

type MessageItem = {
	messageId: number;
	hint: string;
	isUser: boolean;
	icon?: string;
	isDivider?: boolean;
};

function Solo() {
	const [messages, setMessages] = useState<MessageItem[]>([]);
	const [hints, setHints] = useState<string[]>([]);
	// チャットに表示し終えたヒントの数
	const [shownHintCount, setShownHintCount] = useState(0);
	const [gameId, setGameId] = useState<number | null>(null);
	const [inputValue, setInputValue] = useState("");

	const [timeLeft, setTimeLeft] = useState(HINT_INTERVAL_SEC);
	const [hasAnswered, setHasAnswered] = useState(false);
	const [showResultOverlay, setShowResultOverlay] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isShareOpen, setIsShareOpen] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isGivenUp, setIsGivenUp] = useState(false);
	const [pendingHints, setPendingHints] = useState<MessageItem[]>([]);
	const [fetchError, setFetchError] = useState(false);
	const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

	const navigate = useNavigate();

	const messagesAreaRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef(true);
	const hasFetchedData = useRef(false);
	const giveUpTimerRef = useRef<number | null>(null);
	const isGivingUpRef = useRef(false);

	useEffect(() => {
		if (hasFetchedData.current) return;
		hasFetchedData.current = true;

		const fetchGameData = async () => {
			try {
				const res = await fetch("/api/solo", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({}),
				});
				if (!res.ok) {
					throw new Error(`サーバーエラー: ${res.status}`);
				}
				const data = await res.json();
				if (data.result && data.result.hints) {
					setHints(data.result.hints);
					setGameId(data.result.id);
					if (data.result.hints.length > 0) {
						setMessages([
							{
								messageId: 1,
								hint: data.result.hints[0],
								isUser: false,
								icon: HINT_ICONS[0],
							},
						]);
						setShownHintCount(1);
					}
				}
			} catch (e) {
				console.error(e);
				setFetchError(true);
			} finally {
				setIsLoading(false);
			}
		};
		fetchGameData();
	}, []);

	useEffect(() => {
		if (!isLoading) return;
		const interval = setInterval(() => {
			setLoadingMsgIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
		}, 3000);
		return () => clearInterval(interval);
	}, [isLoading]);

	//スクロールされたときに、画面の最も下にあるかどうかを判定する
	const handleScroll = () => {
		if (messagesAreaRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
			//画面から10px下以内にあれば、画面の最も下にあると判定する
			isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 10;
		}
	};

	//画面の最も下にある場合にのみ自動スクロールする
	// biome-ignore lint: messageが変更された時点で下にスクロールするためだけなのでmessageは使っていない
	useEffect(() => {
		if (isAtBottomRef.current && messagesAreaRef.current) {
			messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
		}
	}, [messages]);

	useEffect(() => {
		if (hasAnswered || hints.length === 0) return;

		const timers: number[] = [];

		for (let i = 1; i < hints.length; i++) {
			const delay = i * HINT_INTERVAL_SEC * 1000;

			const timer = setTimeout(() => {
				setMessages((prev) => [
					...prev,
					{
						messageId: i + 1,
						hint: hints[i],
						isUser: false,
						icon: HINT_ICONS[i % HINT_ICONS.length],
					},
				]);
				setShownHintCount(i + 1);

				if (i < hints.length - 1) {
					// 同じ時刻に1秒ごとのカウントダウンが1減らすため、1多くセットする
					setTimeLeft(HINT_INTERVAL_SEC + 1);
				} else {
					setTimeLeft(0); // Stop timer after last message
				}
			}, delay);

			timers.push(timer);
		}

		const interval = setInterval(() => {
			setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => {
			for (const t of timers) {
				clearTimeout(t);
			}
			clearInterval(interval);
		};
	}, [hasAnswered, hints]);

	const handleSubmit = async () => {
		if (!inputValue.trim()) return;
		const newMessage = {
			messageId: Date.now(),
			hint: inputValue,
			isUser: true,
			icon: "😎",
		};
		setMessages((prev) => [...prev, newMessage]);
		setInputValue("");

		if (gameId === null) return;

		try {
			const res = await fetch(`/api/solo/${gameId}/answer`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ answer: newMessage.hint }),
			});
			if (!res.ok) {
				throw new Error(`サーバーエラー: ${res.status}`);
			}
			const data = await res.json();
			const isCorrect = data.isCorrect;

			const responseMessage = {
				messageId: Date.now() + 1,
				hint: isCorrect ? "正解やで！" : "不正解どす...",
				isUser: false,
				icon: isCorrect ? OSAKA_ICON : KYOTO_ICON,
			};
			setMessages((prev) => [...prev, responseMessage]);

			if (isCorrect) {
				setHasAnswered(true);
				setShowResultOverlay(true);
			}
		} catch (error) {
			console.error("Error submitting answer:", error);
			setMessages((prev) => [
				...prev,
				{
					messageId: Date.now() + 1,
					hint: "通信エラーが発生しました。もう一度お試しください。",
					isUser: false,
					icon: KYOTO_ICON,
				},
			]);
		}
	};

	const allHintsShown = hints.length > 0 && shownHintCount >= hints.length;

	// ギブアップ処理：正解を取得してチャットに表示する
	const handleGiveUp = async () => {
		// 正解を表示するまでの間に、もう一度押されても無視する
		if (gameId === null || isGivingUpRef.current) return;
		isGivingUpRef.current = true;

		try {
			const res = await fetch(`/api/solo/${gameId}/answer`);
			if (!res.ok) {
				throw new Error(`サーバーエラー: ${res.status}`);
			}
			const data = await res.json();
			const correctAnswer = data.answer;

			// 「ギブアップ！」のユーザーメッセージを追加
			setMessages((prev) => [
				...prev,
				{
					messageId: Date.now(),
					hint: "ギブアップ！",
					isUser: true,
					icon: "😎",
				},
			]);

			// 少し間を空けてから正解を表示する
			giveUpTimerRef.current = setTimeout(() => {
				setMessages((prev) => [
					...prev,
					{
						messageId: Date.now() + 1,
						hint: `正解は「${correctAnswer}」やで！`,
						isUser: false,
						icon: OSAKA_ICON,
					},
				]);
				setIsGivenUp(true);
				setHasAnswered(true);
				setShowResultOverlay(true);
			}, 500);
		} catch (error) {
			console.error("正解の取得に失敗しました:", error);
			isGivingUpRef.current = false;
			setMessages((prev) => [
				...prev,
				{
					messageId: Date.now(),
					hint: "通信エラーが発生しました。もう一度お試しください。",
					isUser: false,
					icon: KYOTO_ICON,
				},
			]);
		}
	};

	// giveUpTimerのクリーンアップ
	useEffect(() => {
		return () => {
			if (giveUpTimerRef.current !== null) {
				clearTimeout(giveUpTimerRef.current);
			}
		};
	}, []);

	const handleTitle = () => navigate("/");
	const handleRetry = () => window.location.reload();
	const handleShare = () => setIsShareOpen(true);
	const handleBookmark = async () => {
		if (isBookmarked || gameId === null) return;
		setIsAnimating(true);
		setIsBookmarked(true);
		// 茶しばきのアニメーションが終わってからシェア画面を開く
		setTimeout(() => {
			setIsAnimating(false);
			handleShare();
		}, 2000);

		try {
			const res = await fetch(`/api/solo/${gameId}/bookmark`, {
				method: "POST",
			});
			if (!res.ok) throw new Error("通信エラー");
		} catch (e) {
			console.error("ブックマーク登録に失敗しました:", e);
			setIsBookmarked(false);
		}
	};

	const handleCloseResult = () => {
		setShowResultOverlay(false);

		if (shownHintCount < hints.length) {
			const remaining = hints.slice(shownHintCount).map((hint, index) => ({
				messageId: Date.now() + 1000 + index,
				hint: hint,
				isUser: false,
				icon: HINT_ICONS[(shownHintCount + index) % HINT_ICONS.length],
			}));
			setPendingHints(remaining);
		}
	};

	const handleShowStory = () => {
		setMessages((prev) => {
			const newMessages = [...prev];
			const divider = {
				messageId: Date.now() + 999,
				hint: "DIVIDER",
				isUser: false,
				isDivider: true,
			};

			if (newMessages.length >= 2) {
				newMessages.splice(newMessages.length - 2, 0, divider, ...pendingHints);
			} else {
				newMessages.push(divider, ...pendingHints);
			}
			return newMessages;
		});
		setPendingHints([]);
	};

	const handleHideStory = () => {
		setMessages((prev) => {
			const dividerIndex = prev.findIndex((m) => m.isDivider);
			if (dividerIndex === -1) return prev;

			const newMessages = [...prev];
			// Extractstory hints to put back in pendingHints
			const storyHints = newMessages.slice(
				dividerIndex + 1,
				newMessages.length - 2,
			);
			setPendingHints(storyHints);

			// Remove divider and the hints
			newMessages.splice(dividerIndex, storyHints.length + 1);
			return newMessages;
		});
	};

	if (isLoading) {
		return (
			<div className="loading-container">
				<div className="loading-icon-container">
					<img src={OSAKA_ICON} alt="Osaka Icon" className="loading-icon-img" />
				</div>
				<div className="loading-text-container">
					<div className="loading-text">
						関西あるある
						<br />
						<div className="aruaru-text">{LOADING_MESSAGES[loadingMsgIndex]}</div>
					</div>
				</div>
				<div className="spinner" />
				<div className="loading-progress-text">お題とヒントを準備中...</div>
			</div>
		);
	}

	if (fetchError) {
		return (
			<div className="loading-container">
				<div className="loading-icon-container">
					<img src={KYOTO_ICON} alt="Error Icon" className="loading-icon-img" />
				</div>
				<div className="loading-progress-text">読み込みに失敗しました</div>
				<div className="error-actions">
					<button
						type="button"
						className="error-button-primary"
						onClick={() => window.location.reload()}
					>
						もう一度試す
					</button>
					<button
						type="button"
						className="error-button-outlined"
						onClick={() => navigate("/")}
					>
						タイトルに戻る
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="solo-container">
			{showResultOverlay && (
				<ResultOverlay
					isBookmarked={isBookmarked}
					isAnimating={isAnimating}
					onBookmark={handleBookmark}
					onClose={handleCloseResult}
					isGivenUp={isGivenUp}
				/>
			)}
			{isShareOpen && gameId !== null && (
				<ShareModal gameId={gameId} onClose={() => setIsShareOpen(false)} />
			)}
			{!hasAnswered && <Timer seconds={timeLeft} />}
			<div className="messages-area" ref={messagesAreaRef} onScroll={handleScroll}>
				{messages.map((msg, index) => (
					<React.Fragment key={msg.messageId}>
						{msg.isDivider ? (
							<div
								className="story-start-divider"
								onClick={handleHideStory}
								onKeyDown={(e) => e.key === "Enter" && handleHideStory()}
								tabIndex={0}
								role="button"
							>
								<span>物語の続きを閉じる ▲</span>
							</div>
						) : (
							<>
								{pendingHints.length > 0 && index === messages.length - 2 && (
									<div
										className="show-story-trigger"
										onClick={handleShowStory}
										onKeyDown={(e) => e.key === "Enter" && handleShowStory()}
										tabIndex={0}
										role="button"
									>
										<span>物語の続きを見る ▼</span>
									</div>
								)}
								<MessageBubble text={msg.hint} isUser={msg.isUser} icon={msg.icon} />
							</>
						)}
					</React.Fragment>
				))}
				{/* 全ヒント表示後にギブアップの選択肢をチャットとして表示 */}
				{allHintsShown && !hasAnswered && (
					<button
						type="button"
						className="giveup-chat-bubble"
						onClick={handleGiveUp}
					>
						<img src={KYOTO_ICON} alt="icon" className="giveup-icon-img" />
						<span className="giveup-chat-text">答えを見る？</span>
					</button>
				)}
			</div>
			<div className="solo-footer">
				{!hasAnswered || showResultOverlay ? (
					<InputArea
						value={inputValue}
						onChange={setInputValue}
						onSubmit={handleSubmit}
						placeholder="回答を記入してください"
						hidden={hasAnswered}
					/>
				) : (
					<div className="result-buttons-container">
						<ResultButtons
							isBookmarked={isBookmarked}
							isAnimating={isAnimating}
							onBackToTitle={handleTitle}
							onRetry={handleRetry}
							onBookmark={handleBookmark}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default Solo;
