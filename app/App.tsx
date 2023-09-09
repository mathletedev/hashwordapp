import * as Clipboard from "expo-clipboard";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";

interface Response {
	res: string;
}

export default () => {
	const [loaded] = useFonts({
		Rubik: require("./assets/fonts/Rubik-Regular.ttf")
	});

	const [seed, setSeed] = useState("");
	const [key, setKey] = useState("");
	const [calculating, setCalculating] = useState(false);

	if (!loaded) return null;

	const onSubmit = () => {
		if (seed.length < 8)
			return Alert.alert(
				"invalid seed",
				"seed must be at least 8 characters long"
			);
		else if (!key.length)
			return Alert.alert(
				"invalid key",
				"key must be at least 1 character long"
			);

		setCalculating(true);

		fetch("https://hashword.onrender.com", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ seed, key })
		})
			.then(res => res.json())
			.then(async (res: Response) => {
				await Clipboard.setStringAsync(res.res);

				Alert.alert("success!", "password copied to clipboard");

				setCalculating(false);
			})
			.catch(err => console.log(err));
	};

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<Text style={styles.title}>hashword</Text>
			<View style={styles.spacer} />
			<TextInput
				style={styles.input}
				placeholder="seed"
				placeholderTextColor="#a6adc8"
				onChangeText={text => setSeed(text)}
				defaultValue={seed}
			/>
			<View style={styles.spacer} />
			<TextInput
				style={styles.input}
				placeholder="key"
				placeholderTextColor="#a6adc8"
				onChangeText={text => setKey(text)}
				defaultValue={key}
			/>
			<View style={styles.spacer} />
			<TouchableOpacity
				style={styles.button}
				onPress={onSubmit}
				disabled={calculating}
			>
				<Text style={styles.buttonText}>
					{calculating ? "Calculating..." : "Generate!"}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1e1e2e",
		alignItems: "center",
		justifyContent: "center"
	},
	title: {
		fontSize: 48,
		color: "#cdd6f4",
		fontFamily: "Rubik"
	},
	input: {
		width: "80%",
		height: 48,
		paddingHorizontal: 16,
		color: "#cdd6f4",
		backgroundColor: "#313244",
		borderRadius: 8,
		fontFamily: "Rubik"
	},
	spacer: {
		height: 16
	},
	button: {
		alignItems: "center",
		justifyContent: "center",
		width: "80%",
		height: 48,
		backgroundColor: "#89b4fa",
		borderRadius: 8
	},
	buttonText: {
		color: "#313244",
		fontFamily: "Rubik"
	}
});
