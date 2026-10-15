import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import "./ErrorScreen.css";

interface Props {
	readonly backLabel: string;
	readonly onBack: () => void;
}

// データの読み込みに失敗したときに、画面全体に表示する
export default function ErrorScreen({ backLabel, onBack }: Props) {
	return (
		<div className="error-screen">
			<div className="error-screen-icon">
				<img src="/Image/Kyoto.jpg" alt="" />
			</div>
			<p className="error-screen-message">データの読み込みに失敗しました</p>
			<Stack spacing={1} sx={{ width: 200, mt: 1 }}>
				<Button
					size="large"
					variant="contained"
					onClick={() => window.location.reload()}
				>
					もう一度試す
				</Button>
				<Button size="large" variant="outlined" onClick={onBack}>
					{backLabel}
				</Button>
			</Stack>
		</div>
	);
}
