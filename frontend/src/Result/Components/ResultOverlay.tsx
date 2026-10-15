import "../Styles/Result.css";
import ResultButtons from "./ResultButtons";
import { useNavigate } from "react-router-dom";
import ThanksConfetti from "./ThanksConfetti";
import IconButton from "@mui/material/IconButton";
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
		<div
			className="overlay"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose}
			tabIndex={0}
		>
			{!isGivenUp && <ThanksConfetti />}

			<div
				className="result-card"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="dialog"
				tabIndex={-1}
			>
				<IconButton
					className="result-card-close"
					onClick={(e) => {
						e.stopPropagation();
						if (onClose) onClose();
					}}
					size="small"
				>
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
	);
}
