
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field
from typing import Literal, List
from typing_extensions import TypedDict
import os
from db import VDB
from groq import Groq
from fastapi import FastAPI, File, UploadFile, Form


client = Groq()

# async def transcribe_audio(audio_file):
#     return client.audio.transcriptions.create(
#         file=audio_file,
#         model="whisper-large-v3-turbo",
#         response_format="verbose_json",
#         language="en",
#         temperature=0.0,
#         timestamp_granularities=["word", "segment"]
#     )

async def transcribe_audio(upload_file: UploadFile):
    # Go to beginning of file (safe to ensure it's ready)
    await upload_file.seek(0)

    # Wrap it correctly: (filename, file object, MIME type)
    return client.audio.transcriptions.create(
        file=(upload_file.filename, upload_file.file, upload_file.content_type),
        model="whisper-large-v3-turbo",
        response_format="verbose_json",
        language="en",
        temperature=0.0
    )


class GradeDocuments(BaseModel):
    """Binary score for relevance check on retrieved documents."""
    binary_score: Literal["yes", "no"] = Field(
        description="Indicates whether the documents are relevant to the question. Allowed values: 'yes' or 'no'."
    )
class GraphState(TypedDict):
    """
    Represents the state of our graph.
    Attributes:
        question: question
        generation: LLM response generation
        context_relevance: flag of whether documents provided are relevant - yes or no
        documents: list of retrived documents
        collection_name: name of the collection in the vector db to retrive from 
        page_numbers: list of page numbers of the retrived documents
        user_id : specific to user to have separate vector dbs for each user
    """
    question: str
    generation: str
    context_relevance: str
    documents: List[str]
    collection_name: str
    page_numbers: List[int]
    user_id : int


class Agent:
    def __init__(self):
        self.llm = ChatGroq(temperature=0.3,
                      model_name="llama-3.3-70b-versatile",
                      api_key=os.getenv("GROQ_API_KEY"),)
        self.structured_llm_grader = self.llm.with_structured_output(GradeDocuments)
        self.SYS_PROMPT = """You are an expert grader assessing relevance of a retrieved document to a user question.
                Follow these instructions for grading:
                  - If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant.
                  - Your grade should be either 'yes' or 'no' to indicate whether the document is relevant to the question or not."""
        self.grade_prompt = ChatPromptTemplate.from_messages(
                                                [
                                                    ("system", self.SYS_PROMPT),
                                                    ("human", """Retrieved document:
                                                                {documents}
                                                                User question:
                                                                {question}
                                                            """),
                                                ]
                                            )
        # Build grader chain
        self.doc_grader_chain = (self.grade_prompt | self.structured_llm_grader)
        # Create RAG prompt for response generation
        self.prompt = """You are an assistant for question-answering tasks.
                        Use the following pieces of retrieved context to answer the question.
                        If no context is present , just say that you don't know the answer.
                        Do not make up the answer unless it is there in the provided context.
                        Give a detailed answer and to the point answer with regard to the question.
                        Question:
                        {question}
                        Context:
                        {documents}
                        Answer:
                    """
        self.prompt_template = ChatPromptTemplate.from_template(self.prompt)
        # Build grader chain
        self.qa_rag_chain = (self.prompt_template | self.llm | StrOutputParser())
        self.db = VDB(r"data\real_estate_laws_India.pdf")

    async def retrieve(self, state):
        """
            Retrieve documents
            Args:
                state (dict): The current graph state
            Returns:
                state (dict): New key added to state, documents - that contains retrieved context documents
        """
        print("---RETRIEVAL FROM VECTOR DB---")
        question = state["question"]
        coll_name = state['collection_name']
        user_id = state['user_id']
        # Retrieval
        documents = self.db.retrieve(question, collection_name=coll_name, user_id=user_id)
        return {"question": question, "documents": documents}
    
    def grade_documents(self, state):
        """
        Determines whether the retrieved documents are relevant to the question
        by using an LLM Grader.
        If all documents are not relevant to question or documents are empty - context_relevance is no 
        If any of documents is relevant to question - context_relevance is yes
        Helps filtering out irrelevant documents
        Args:
            state (dict): The current graph state
        Returns:
            state (dict): Updates documents key with only filtered relevant documents
        """
        print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
        question = state["question"]
        documents = state["documents"]
        # Score each doc
        filtered_docs = []
        context_relevance = "no"
        if documents:
            for d in documents:
                score = self.doc_grader_chain.invoke(
                    {"question": question, "documents": d.page_content}
                )
                grade = score.binary_score
                print(grade)
                print("#####################################")
                print(d.page_content)
                if grade == "yes":
                    print("---GRADE: DOCUMENT RELEVANT---")
                    filtered_docs.append(d)
                    context_relevance = "yes"
                else:
                    print("---GRADE: DOCUMENT NOT RELEVANT---")
                    # web_search_needed = "Yes"
                    # continue
        else:
            print("---NO DOCUMENTS RETRIEVED---")
            context_relevance = "no"
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        print(filtered_docs)
        return {"documents": filtered_docs, "question": question, 
                "context_relevance": context_relevance}
    
    def generate_answer(self, state):
        """
        Generate answer from context document using LLM
        Args:
            state (dict): The current graph state
        Returns:
            state (dict): New keys added to state, 1) generation, that contains LLM generation and 2) page_numbers from metadata of the documents
    
        """
        print("---GENERATE ANSWER---")
        question = state["question"]
        documents = state["documents"]
        page_numbers = [meta.metadata['page_number'] for meta in documents]
        # RAG generation
        generation = self.qa_rag_chain.invoke({"documents": documents, "question": question})
        return {"documents": documents, "question": question, 
                "generation": generation, 'page_numbers' : page_numbers}
    
    def decide_to_generate(self, state):
        """
        Determines whether to generate an answer, or re-generate a question.
        Args:
            state (dict): The current graph state
        Returns:
            str: Binary decision for next node to call 
        """
        print("---ASSESS GRADED DOCUMENTS---")
        context_relevance = state["context_relevance"]
        if context_relevance == "yes":
            # All documents have been filtered check_relevance
            # We will re-generate a new query
            print("---DECISION: SOME or ALL DOCUMENTS ARE RELEVANT TO QUESTION, GENERATE ANSWER---")
            return "generate_answer"
        else:
            # We don't relevant documents, so END
            print("---DECISION: NO RELEVENT DOCUMENTS SO END---")
            return "end"



