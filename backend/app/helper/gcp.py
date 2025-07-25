from google.cloud import speech_v1p1beta1 as speech
from core.config import settings
import os

# Make sure the environment variable is set (optional if already set globally)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS

# Create and reuse a singleton Speech client
speech_client = speech.SpeechClient()
