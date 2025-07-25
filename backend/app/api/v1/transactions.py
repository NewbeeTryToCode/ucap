from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from db.db import get_db
from schemas.schemas import TransactionFromLLM, TransactionRequest, PrepareTranscriptRequest, ParseTranscriptRequest
from services.transaction import create_transaction_from_llm
from services.transcript import prepare_transcript_service
from services.llm import parse_transcript_with_llm
from sqlalchemy import text
from services.speech import speech_to_text

router = APIRouter( tags=["transactions"])

@router.post("/generate-draft", summary="generate draft transaction from audio")
async def generate_draft(
    audio: UploadFile = File(...), 
    db: Session = Depends(get_db),
    umkm_id: int = 1):
    """
    Endpoint to process audio file and create transaction.
    """
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file uploaded")

    audio_bytes = await audio.read()
    # Step 1: Speech to text
    try:
        transcript = speech_to_text(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text failed: {str(e)}")

    # Step 2: Prepare transcript
    try:
        prep_req = PrepareTranscriptRequest(umkm_id=umkm_id, transcript=transcript)
        print(f"Prepare request: {prep_req}")
        prep_result = prepare_transcript_service(prep_req, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prepare transcript failed: {str(e)}")

    # Step 3: Parse transcript with LLM
    try:
        parse_req = ParseTranscriptRequest(
            umkm_id=prep_result["umkm_id"],
            transcript=prep_result["transcript"],
            product_list=prep_result["product_list"]
        )
        print(f"Parse request: {parse_req}")
        parse_result = parse_transcript_with_llm(parse_req)  # Pastikan fungsi ini import dan tersedia
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse transcript failed: {str(e)}")
    print(f"Draft transaction: {parse_result}")

    # Step 4: Create transaction from parsed data
    return {
        "message": "Draft transaction generated successfully",
        "draft_transaction": parse_result,
        "transcript": transcript
    }
    


@router.post("/confirm", summary="confirm transaction from LLM")
async def confirm_transaction(
    payload: TransactionFromLLM,
    db: Session = Depends(get_db)
):
    """
    Endpoint to confirm transaction from LLM.
    """
    if not payload or not payload.items:
        raise HTTPException(status_code=400, detail="Invalid transaction data")

    try:
        print(f"Creating transaction from payload: {payload}")
        result = create_transaction_from_llm(payload, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transaction creation failed: {str(e)}")