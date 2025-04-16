from PyPDF2 import PdfReader 
from langchain_chroma import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from langchain_community.vectorstores.utils import filter_complex_metadata
from db import VDB
from utilities import *
from langgraph.graph import END, StateGraph
from groq import Groq
import chromadb
import os
from fastapi.middleware.cors import CORSMiddleware

from typing import Union, List
from fastapi import FastAPI
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from io import BytesIO

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

client = Groq()

# Initialize graph once
nodes = Agent()
agentic_rag = StateGraph(GraphState)
agentic_rag.add_node("retrieve", nodes.retrieve)
agentic_rag.add_node("grade_documents", nodes.grade_documents)
agentic_rag.add_node("generate_answer", nodes.generate_answer)
agentic_rag.set_entry_point("retrieve")
agentic_rag.add_edge("retrieve", "grade_documents")
agentic_rag.add_conditional_edges(
    "grade_documents",
    nodes.decide_to_generate,
    {"generate_answer": "generate_answer", "end": END},
)
agentic_rag.add_edge("generate_answer", END)
compiled_graph = agentic_rag.compile()


@app.post("/upload_pdf")
async def upload_pdf(
    user_id: str = Form(...),  # explicitly from query params
    file_pdf: UploadFile = File(...)
):
    print("Inside upload pdf")
    contents = await file_pdf.read()
    uploaded_pdf_obj = BytesIO(contents)
    uploaded_pdf_content = PdfReader(uploaded_pdf_obj)
    meta_data = uploaded_pdf_content.metadata
    print("PDF read successfull")

    docs = []
    for i, page in enumerate(uploaded_pdf_content.pages):
        docs.append({
            'metadata': {'page_number':i+1,
                        # 'title':meta_data.title
                        },
            'data':page.extract_text()
            })
    print("Divided into docs")
    # docs = filter_complex_metadata(docs)
    splitter  = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=300)
    docs = [Document(page_content=doc['data'], metadata=doc['metadata']) for doc in docs]
    chunked_docs = splitter.split_documents(docs)
    print("Divided into chunks>>>>>>>>>>>>>", chunked_docs)
    persistent_client = chromadb.PersistentClient(path=f"{user_id}_db")
    chroma_client = Chroma.from_documents(documents = chunked_docs, 
                            collection_name = meta_data.get("/Title").replace(" ", '-')[:10],
                            embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"),
                            collection_metadata={"hnsw:space": "cosine"}, 
                            # other options are 'l2', 'ip'
                            persist_directory=f"./{user_id}_db", )
    print("Embeded")
    return JSONResponse(content={"filename": file_pdf.filename, "message": "PDF uploaded successfully",
                                 "metadata":meta_data, "coll_name":meta_data.get("/Title").replace(" ", '-')[:10]})


# -------------------------------
# 1. Endpoint to retrieve transcript and chunks
# -------------------------------
@app.post("/retrieve_chunks/")
async def retrieve_chunks(
    collection_name: str = Form(...),
    user_id : str = Form(...),
    question_text: str = Form(None),
    question_audio: UploadFile = File(None)
):
    print("Inside retrieve chuncks")
    # print(question_audio.filename)
    # print(question_audio.file)
    if not question_text and not question_audio:
        return JSONResponse(status_code=400, content={"error": "Provide text or audio."})

    if question_audio:
        transcript = await transcribe_audio(question_audio)
        print(transcript)
        question = transcript.text
    else:
        question = question_text

    response = await compiled_graph.ainvoke({"question": question, "collection_name": collection_name, "user_id": user_id})
    print(response)
    return {
        "question": question,
        "retrieved_docs": response.get("generation", []),
        "page_numbers": set(response.get("page_numbers", []))
    }
