from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import sqlite3
import hashlib
import secrets
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            token TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

def hash_password(password: str) -> str:
    # Basic SHA-256 hash for MVP (in prod, use bcrypt)
    return hashlib.sha256(password.encode()).hexdigest()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM users WHERE token = ?", (token,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return dict(user)

class UserRegister(BaseModel):
    username: str
    name: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user: UserRegister):
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            "INSERT INTO users (username, name, password_hash) VALUES (?, ?, ?)",
            (user.username, user.name, hash_password(user.password))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    conn.close()
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    db_user = conn.execute("SELECT * FROM users WHERE username = ?", (user.username,)).fetchone()
    
    if not db_user or db_user["password_hash"] != hash_password(user.password):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = secrets.token_hex(32)
    conn.execute("UPDATE users SET token = ? WHERE username = ?", (token, user.username))
    conn.commit()
    conn.close()
    
    return {"access_token": token, "token_type": "bearer", "name": db_user["name"], "username": db_user["username"]}

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE users SET token = NULL WHERE username = ?", (current_user["username"],))
    conn.commit()
    conn.close()
    return {"message": "Logged out successfully"}

@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "name": current_user["name"]}
