import { App, Menu, Plugin, PluginSettingTab, Setting, Notice, TFile } from 'obsidian';
import { PiperReaderSettings, DEFAULT_SETTINGS } from './types';
import { PiperIntegration } from './piper';
import { AudioPlayer } from './audio';

export default class PiperReader extends Plugin {
	settings!: PiperReaderSettings;
	piperIntegration!: PiperIntegration;
	audioPlayer!: AudioPlayer;
	private statusBarItem!: HTMLElement;

	async onload() {
		await this.loadSettings();

		// Initialize components
		this.piperIntegration = new PiperIntegration(
			this.settings.piperBinaryPath,
			this.settings.modelPath,
			this.settings.outputTempPath
		);
		this.audioPlayer = new AudioPlayer();

		// Add command
		this.addCommand({
			id: 'read-current-note',
			name: 'Read current note with Piper',
			callback: () => this.readCurrentNote()
		});

		this.addCommand({
			id: 'stop-reading',
			name: 'Stop reading',
			callback: () => this.stopReading()
		});

		// Right-click context menu on files
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
				menu.addItem((item) => {
					item
						.setTitle('Read with Piper')
						.setIcon('volume-2')
						.onClick(() => this.readFile(file));
				});
			})
		);

		// Status bar stop button (hidden until playback starts)
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.setText('⏹ Stop reading');
		this.statusBarItem.style.cursor = 'pointer';
		this.statusBarItem.style.display = 'none';
		this.statusBarItem.addEventListener('click', () => this.stopReading());

		// Add settings tab
		this.addSettingTab(new PiperSettingTab(this.app, this));
	}

	onunload() {
		this.stopReading();
	}

	stopReading() {
		this.audioPlayer?.stop();
		this.statusBarItem.style.display = 'none';
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// Update Piper integration with new settings
		this.piperIntegration = new PiperIntegration(
			this.settings.piperBinaryPath,
			this.settings.modelPath,
			this.settings.outputTempPath
		);
	}

	async readCurrentNote() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file found');
			return;
		}
		await this.readFile(activeFile);
	}

	async readFile(file: TFile) {
		try {
			const content = await this.app.vault.read(file);

			if (!content.trim()) {
				new Notice('Note is empty');
				return;
			}

			const loadingNotice = new Notice('Generating speech...', 0);

			try {
				const audioFilePath = await this.piperIntegration.synthesizeSpeech(content);
				loadingNotice.hide();

				this.statusBarItem.style.display = '';
				await this.audioPlayer.playAudio(audioFilePath);

				this.audioPlayer.audioEndedEvent = async () => {
					this.statusBarItem.style.display = 'none';
					await this.piperIntegration.cleanupTempFile(audioFilePath);
				};

			} catch (error) {
				loadingNotice.hide();
				this.statusBarItem.style.display = 'none';
				throw error;
			}

		} catch (error) {
			console.error('Piper Reader error:', error);
			new Notice(`Error: ${(error as Error).message}`);
		}
	}
}

class PiperSettingTab extends PluginSettingTab {
	plugin: PiperReader;

	constructor(app: App, plugin: PiperReader) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Crispy\'s Text to Speech Settings' });

		new Setting(containerEl)
			.setName('Piper Binary Path')
			.setDesc('Path to the Piper executable (e.g., /usr/local/bin/piper)')
			.addText(text => text
				.setPlaceholder('/usr/local/bin/piper')
				.setValue(this.plugin.settings.piperBinaryPath)
				.onChange(async (value) => {
					this.plugin.settings.piperBinaryPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model Path')
			.setDesc('Path to the Piper model file (.onnx)')
			.addText(text => text
				.setPlaceholder('/path/to/model.onnx')
				.setValue(this.plugin.settings.modelPath)
				.onChange(async (value) => {
					this.plugin.settings.modelPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Output Temp Path')
			.setDesc('Directory for temporary WAV files (leave empty for system temp)')
			.addText(text => text
				.setPlaceholder('System temp directory')
				.setValue(this.plugin.settings.outputTempPath)
				.onChange(async (value) => {
					this.plugin.settings.outputTempPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Model')
			.setDesc('Default Piper model name (for reference)')
			.addText(text => text
				.setValue(this.plugin.settings.defaultModel)
				.setDisabled(true));
	}
}
