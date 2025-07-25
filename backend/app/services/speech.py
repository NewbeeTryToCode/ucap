from google.cloud import speech_v1p1beta1 as speech
from helper.gcp import speech_client as client 

def speech_to_text(audio_bytes: bytes) -> str:
    print("Audio file received. Size:", len(audio_bytes), "bytes")

    audio = speech.RecognitionAudio(content=audio_bytes)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,  # <- correct format
        sample_rate_hertz=48000,  # <- match the file's actual sample rate
        language_code="id-ID"
    )
    try:
        response = client.recognize(config=config, audio=audio)
    except Exception as e:
        print(f"Error during speech recognition: {e}")
        raise
    transcript = " ".join([result.alternatives[0].transcript for result in response.results])
    print(f"TRANSCRIPT: {transcript}")

    return transcript
