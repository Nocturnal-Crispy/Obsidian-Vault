import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import * as process from 'process';

export class PiperIntegration {
	private binaryPath: string;
	private modelPath: string;
	private tempPath: string;

	constructor(binaryPath: string, modelPath: string, tempPath?: string) {
		this.binaryPath = binaryPath;
		this.modelPath = modelPath;
		this.tempPath = tempPath || tmpdir();
	}

	async synthesizeSpeech(text: string): Promise<string> {
		if (!this.binaryPath || !this.modelPath) {
			throw new Error('Piper binary path and model path must be configured');
		}

		// Sanitize text for Piper
		const sanitizedText = this.sanitizeText(text);
		
		// Generate unique output filename
		const timestamp = Date.now();
		const random = Math.floor(Math.random() * 1000);
		const outputFileName = `piper-${timestamp}-${random}.wav`;
		const outputPath = join(this.tempPath, outputFileName);

		try {
			// Run Piper CLI
			const result = await this.runPiper(sanitizedText, outputPath);
			
			if (result.success) {
				return outputPath;
			} else {
				throw new Error(`Piper synthesis failed: ${result.error}`);
			}
		} catch (error) {
			// Clean up on failure
			try {
				await unlink(outputPath);
			} catch (cleanupError) {
				// Ignore cleanup errors
			}
			throw error;
		}
	}

	private async runPiper(text: string, outputPath: string): Promise<{success: boolean, error?: string}> {
		return new Promise((resolve) => {
			// Set LD_LIBRARY_PATH to include our local lib directory
			const env = { ...global.process.env };
			env.LD_LIBRARY_PATH = `/home/mcrispen/.local/share/piper:${global.process.env.LD_LIBRARY_PATH || ''}`;
			
			const args = [
				'-m', this.modelPath,
				'-f', outputPath,
				'--espeak_data', '/home/mcrispen/.local/share/piper/espeak-ng-data'
			];

			const piperProcess: ChildProcess = spawn(this.binaryPath, args, { env });
			
			let stderr = '';
			let stdout = '';

			piperProcess.stderr?.on('data', (data) => {
				stderr += data.toString();
			});

			piperProcess.stdout?.on('data', (data) => {
				stdout += data.toString();
			});

			piperProcess.on('error', (error) => {
				resolve({ success: false, error: error.message });
			});

			piperProcess.on('close', (code) => {
				if (code === 0) {
					resolve({ success: true });
				} else {
					resolve({ 
						success: false, 
						error: `Piper exited with code ${code}. Stderr: ${stderr}` 
					});
				}
			});

			// Write text to stdin
			if (piperProcess.stdin) {
				piperProcess.stdin.write(text);
				piperProcess.stdin.end();
			}
		});
	}

	private sanitizeText(text: string): string {
		// Remove or replace problematic characters for TTS
		return text
			.replace(/\[([^\]]+)\]/g, '') // Remove markdown links
			.replace(/```[\s\S]*?```/g, '') // Remove code blocks
			.replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
			.replace(/#{1,6}\s+/g, '') // Remove markdown headers
			.replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
			.replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links to text
			.replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
			.replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
			.replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
			.trim();
	}

	async cleanupTempFile(filePath: string): Promise<void> {
		try {
			await unlink(filePath);
		} catch (error) {
			// Ignore cleanup errors
		}
	}
}
