class AudioService:
    """Audio processing placeholder for STT and analysis pipelines."""

    async def transcribe(self, audio_path: str) -> str:
        # Hook faster-whisper integration here in the next step.
        return f"Transcription placeholder for: {audio_path}"


audio_service = AudioService()
