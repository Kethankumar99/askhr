from groq import Groq
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.user import User
from app.services.document_service import get_or_create_collection

# ── GROQ SETUP ──

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY)

def verify_employee(db: Session, email: str, company_email: str) -> bool:
    employee = db.query(Employee).filter(
        Employee.email == email,
        Employee.company_email == company_email
    ).first()
    return employee is not None

def search_policies(company_email: str, query: str, n_results: int = 3) -> list:
    try:
        collection = get_or_create_collection(company_email)
        results = collection.query(query_texts=[query], n_results=n_results)
        documents = []
        if results and results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i] if results['metadatas'] else {}
                distance = results['distances'][0][i] if results['distances'] else 0
                documents.append({
                    "text": doc,
                    "filename": metadata.get('filename', 'Unknown'),
                    "relevance_score": round(1 - distance, 2) if distance else 1.0
                })
        return documents
    except Exception as e:
        print(f"Search error: {str(e)}")
        return []

def generate_with_ai(query: str, relevant_docs: list, company_name: str) -> dict:
    """AI powered response using Groq"""
    
    # Build context from policies
    if relevant_docs:
        context = "\n\n".join([doc['text'] for doc in relevant_docs])
        sources = list(set([doc['filename'] for doc in relevant_docs]))
        confidence = relevant_docs[0]['relevance_score']
    else:
        context = "No specific policy documents found."
        sources = []
        confidence = 0
    
    # System prompt
    system_prompt = f"""You are a friendly HR Assistant for {company_name}.
- If greeting (hi, hello, hey), greet back warmly in 1 line
- If casual talk, respond naturally in 1-2 lines
- If policy question, answer ONLY from the context below
- If answer not in context, say politely that you don't have that info
- Keep responses short and helpful
- Be professional but friendly"""

    user_prompt = f"""Context: {context}

Employee Question: {query}

Your Response:"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=250,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content.strip()
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence
        }
    
    except Exception as e:
        print(f"Groq error: {str(e)}")
        # Fallback
        if relevant_docs:
            return {
                "answer": f"Based on our policies:\n\n{relevant_docs[0]['text']}",
                "sources": sources,
                "confidence": 0.5
            }
        return {
            "answer": f"👋 Hello! Welcome to {company_name}'s HR Assistant. How can I help you?",
            "sources": [],
            "confidence": 1.0
        }

def chat_with_bot(db: Session, employee_email: str, company_email: str, question: str) -> dict:
    if not verify_employee(db, employee_email, company_email):
        return {"success": False, "message": "Employee not found"}
    
    user = db.query(User).filter(User.email == company_email).first()
    company_name = user.company_name if user else "Company"
    
    relevant_docs = search_policies(company_email, question)
    result = generate_with_ai(question, relevant_docs, company_name)
    
    return {
        "success": True,
        "question": question,
        "answer": result['answer'],
        "sources": result['sources'],
        "confidence": result['confidence']
    }