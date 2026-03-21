export interface PiperSettings {
	piperBinaryPath: string;
	modelPath: string;
	outputTempPath: string;
}

export interface PiperReaderSettings extends PiperSettings {
	defaultModel: string;
}

export const DEFAULT_SETTINGS: PiperReaderSettings = {
	piperBinaryPath: '/home/mcrispen/.local/share/piper/piper',
	modelPath: '/home/mcrispen/.local/share/piper/models/en_US-lessac-medium.onnx',
	outputTempPath: '/tmp',
	defaultModel: 'en_US-lessac-medium'
};
