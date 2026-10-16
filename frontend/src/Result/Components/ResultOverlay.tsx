import "../Styles/Result.css";
import ResultButtons from "./ResultButtons";
import { useNavigate } from "react-router-dom";
import ThanksConfetti from "./ThanksConfetti";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
	readonly isBookmarked: boolean;
	readonly isAnimating: boolean;
	readonly onBookmark: () => void;
	readonly onClose?: () => void;
	readonly isGivenUp?: boolean;
}

export default function ResultOverlay({
	isBookmarked,
	isAnimating,
	onBookmark,
	onClose,
	isGivenUp = false,
}: Props) {
	const navigate = useNavigate();

	const handleTitle = () => navigate("/");
	const handleRetry = () => window.location.reload();

	return (
		// 背景クリックと Escape キーで閉じる処理は Modal に任せる
		<Modal
			open
			onClose={onClose}
			className="centered-modal"
			slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.4)" } } }}
		>
			<div className="result-modal" role="dialog" aria-label="結果" tabIndex={-1}>
				{!isGivenUp && <ThanksConfetti />}

				<div className="result-card">
					<IconButton className="result-card-close" onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>

					{!isGivenUp && <h1 className="seikai-text">正解</h1>}

					<ResultButtons
						isBookmarked={isBookmarked}
						isAnimating={isAnimating}
						onBackToTitle={handleTitle}
						onRetry={handleRetry}
						onBookmark={onBookmark}
					/>
				</div>
			</div>
		</Modal>
	);
}
