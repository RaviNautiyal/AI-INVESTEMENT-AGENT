from fastapi import APIRouter, HTTPException, Header
from app.database.db import users_collection
from app.utils.auth import hash_password, verify_password, create_access_token, decode_token
from pydantic import BaseModel

router = APIRouter()

class UserSchema(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: UserSchema):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    users_collection.insert_one({
        "email": user.email,
        "password": hashed,
         "plan": "free",
    "ai_queries_today": 0,
    "ai_queries_date": "",
    "subscribed_at": None
    })
    return {"message": "Account created successfully"}

@router.post("/login")
def login(user: UserSchema):
    existing = users_collection.find_one({"email": user.email})
    if not existing:
        raise HTTPException(status_code=400, detail="Email not found")

    if not verify_password(user.password, existing["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token({"sub": user.email})
    return {"token": token, "email": user.email}

@router.get("/me")
def get_me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"email": email}

@router.delete("/clear-users")
def clear_users():
    users_collection.delete_many({})
    return {"message": "Users cleared"}