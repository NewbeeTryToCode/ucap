from fastapi import APIRouter, UploadFile, File, HTTPException, WebSocket
from services.speech import speech_to_text 
import asyncio

router = APIRouter()

@router.post("/speech-to-text")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Endpoint to handle speech-to-text conversion.
    """
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file uploaded")

    audio_bytes = await audio.read()
    try:
        transcript = speech_to_text(audio_bytes)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text failed: {str(e)}")

@router.websocket("/ws/speech-to-text")
async def websocket_speech_to_text(websocket: WebSocket):
    """
    WebSocket endpoint to handle real-time speech-to-text conversion.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            if not data:
                break
            transcript = speech_to_text(data)
            await websocket.send_text(transcript)
    except Exception as e:
        await websocket.close(code=1000, reason=f"Error: {str(e)}")
    finally:
        await websocket.close()