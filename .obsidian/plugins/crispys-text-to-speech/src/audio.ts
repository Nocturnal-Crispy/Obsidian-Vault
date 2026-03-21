import { readFile } from 'fs/promises';

export class AudioPlayer {
	private currentAudio: HTMLAudioElement | null = null;
	private currentFilePath: string | null = null;
	private currentBlobUrl: string | null = null;
	public audioEndedEvent: (() => void) | null = null;

	async playAudio(filePath: string): Promise<void> {
		// Stop any currently playing audio
		this.stop();

		try {
			// Read WAV file as buffer and create a Blob URL
			// This bypasses Electron/Flatpak file:// restrictions
			const buffer = await readFile(filePath);
			const blob = new Blob([new Uint8Array(buffer)], { type: 'audio/wav' });
			const blobUrl = URL.createObjectURL(blob);
			this.currentBlobUrl = blobUrl;

			this.currentAudio = new Audio(blobUrl);
			this.currentFilePath = filePath;

			// Set up event handlers
			this.currentAudio.addEventListener('ended', () => {
				if (this.audioEndedEvent) {
					this.audioEndedEvent();
				}
				this.cleanup();
			});

			this.currentAudio.addEventListener('error', (error) => {
				console.error('Audio playback error:', error);
				this.cleanup();
			});

			// Play the audio
			await this.currentAudio.play();
		} catch (error) {
			this.cleanup();
			throw error;
		}
	}

	stop(): void {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
		}
		this.cleanup();
	}

	pause(): void {
		if (this.currentAudio && !this.currentAudio.paused) {
			this.currentAudio.pause();
		}
	}

	resume(): void {
		if (this.currentAudio && this.currentAudio.paused) {
			this.currentAudio.play().catch(error => {
				console.error('Failed to resume audio:', error);
			});
		}
	}

	isPlaying(): boolean {
		return this.currentAudio !== null && !this.currentAudio.paused;
	}

	isPaused(): boolean {
		return this.currentAudio !== null && this.currentAudio.paused;
	}

	getCurrentTime(): number {
		return this.currentAudio?.currentTime || 0;
	}

	getDuration(): number {
		return this.currentAudio?.duration || 0;
	}

	setCurrentTime(time: number): void {
		if (this.currentAudio) {
			this.currentAudio.currentTime = time;
		}
	}

	private cleanup(): void {
		if (this.currentBlobUrl) {
			URL.revokeObjectURL(this.currentBlobUrl);
			this.currentBlobUrl = null;
		}
		if (this.currentAudio) {
			this.currentAudio = null;
		}
		this.currentFilePath = null;
	}

	getCurrentFilePath(): string | null {
		return this.currentFilePath;
	}
}
