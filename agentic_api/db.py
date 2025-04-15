from langchain.docstore.document import Document
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
import chromadb
from PyPDF2 import PdfReader 
from dotenv import load_dotenv

load_dotenv()

class PDFChunker:
    def __init__(self, path):
        self.path = path
    def get_embeddings(self):
        embed = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        return embed
    def pdf_to_docs(self):
        pdf = PdfReader(self.path)
        meta = pdf.metadata
        docs = []
        for i, page in enumerate(pdf.pages):
            docs.append({
                'metadata': {'page_number':i+1,
                            'title':meta.title},
                'data':page.extract_text()
            })
        return docs, meta
    def chunck_docs(self):
        docs, meta = self.pdf_to_docs()
        splitter  = RecursiveCharacterTextSplitter(chunk_size=30000, chunk_overlap=300)
        docs = [Document(page_content=doc['data'], metadata=doc['metadata']) for doc in docs]
        chunked_docs = splitter.split_documents(docs)
        return chunked_docs



class VDB:
    def __init__(self, path=None):
        self.path = path
        # self.pdf = PDFChunker(path)
        # self.chuncked_docs = self.pdf.chunck_docs()
        
    # def embed_chuncks(self, collection_name):
    #     chroma_client = Chroma.from_documents(documents = self.chuncked_docs,
    #                               collection_name = collection_name,
    #                               embedding = self.pdf.get_embeddings(),
    #                               collection_metadata={"hnsw:space": "cosine"}, 
    #                               # other options are 'l2', 'ip'
    #                               persist_directory="./realestateIndiaLawsDB")
        # return chroma_client
    def get_retriver(self, user_id, collection_name):
        client =  Chroma(collection_name = collection_name, 
               embedding_function = PDFChunker(self.path).get_embeddings(),
               persist_directory = f'{user_id}_db',       
               )
        return client.as_retriever(search_type="similarity_score_threshold",
                       search_kwargs={"k": 3,                                                                       
                       "score_threshold": 0.3})

    # def get_collection(self):
    #     # persistent_client = chromadb.PersistentClient()
    #     # collection = persistent_client.get_or_create_collection("legal_real_estate_India")
    #     # vector_store_from_client = Chroma(
    #     #             client=persistent_client,
    #     #             collection_name="collection_name",
    #     #             embedding_function=self.get_embeddings(),
    #     #         )
    #     return collection

    def retrieve(self, query, user_id, collection_name="Real-Estat" ):
        similarity_threshold_retriever = self.get_retriver(user_id, collection_name)
        # chroma_db.query(query_texts=query,n_results=3, )
        retrived_documents = similarity_threshold_retriever.invoke(query)
        return retrived_documents 
    


if __name__ == "__main__":
    db = VDB(r"1_db")
    # _ = db.embed_chuncks()
    rdocs = db.retrieve("What is real estate?")
    print([meta.metadata['page_number'] for meta in rdocs])





