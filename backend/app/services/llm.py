from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from schemas.schemas import TransactionFromLLM, ParseTranscriptRequest
from core.config import settings
import os 

#setup langchain
parser = PydanticOutputParser(pydantic_object=TransactionFromLLM)
prompt = ChatPromptTemplate.from_template(
    """
    Kamu adalah asisten untuk UMKM. Berikut adalah daftar produk yang dijual oleh UMKM:

    {product_list}

    Kalimat transkrip dari penjual: "{input_text}"

    Tugasmu:
    - Tentukan jenis transaksi: purchase atau sale (puntuk sekarang semua trx merupakan sale)
    - Jika transaksi adalah purchase, tentukan supplier_id (gunakan angka antara 1-10 jika tidak ada info eksplisit)
    - Ambil item yang disebut, cocokkan nama dengan daftar produk
    - Lengkapi product_id, nama, quantity, unit_price
    - Tambahkan catatan (notes) berisi teks transkrip asli

    Format output JSON:
    {format_instructions}
    """
)
llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0, openai_api_key=settings.OPENAI_API_KEY)

chain = prompt | llm | parser

def parse_transcript_with_llm(data: ParseTranscriptRequest) -> TransactionFromLLM:
    product_lines = "\n".join(f"- {p.name} (Rp {p.price})" for p in data.product_list)

    result = chain.invoke({
        "input_text": data.transcript,
        "product_list": product_lines,
        "format_instructions": parser.get_format_instructions()
    })

    return result
