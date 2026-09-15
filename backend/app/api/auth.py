import re
import time
import random
from typing import Optional, Dict, Tuple
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.models.user import User, UserProfile
from app.schemas.auth import (
    UserCreate, 
    UserLogin, 
    Token, 
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthMessageResponse
)
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# In-memory OTP store: email -> (otp_code, expiry_timestamp)
OTP_STORE: Dict[str, Tuple[str, float]] = {}

KEYBOARD_PATTERNS = [
    "qwerty", "asdfgh", "zxcvbn", "dcfvgb", "qazwsx", "123456", "abcdef", "poiuyt", "lkjhgf", "mnbvcx"
]

def validate_citizen_email(email: str) -> Tuple[bool, str]:
    email = email.strip().lower()
    if "@" not in email:
        return False, "Invalid email address format."
    
    parts = email.split("@", 1)
    if len(parts) != 2 or not parts[0] or not parts[1]:
        return False, "Invalid email address format."
        
    username, domain = parts
    
    # 1. Domain restriction: Genuine Gmail or verified institutional/edu/gov domains
    allowed_domains = ["gmail.com", "googlemail.com", "rmkec.ac.in", "citizen.in", "sathyamithra.gov.in"]
    is_allowed = (
        domain in allowed_domains or 
        domain.endswith(".gov.in") or 
        domain.endswith(".nic.in") or 
        domain.endswith(".ac.in") or 
        domain.endswith(".edu")
    )
    if not is_allowed:
        return False, "Only legitimate Gmail accounts (@gmail.com) or verified institutional/government email addresses are permitted. Random or temporary domains are not allowed."
    
    # 2. Length check for Gmail username (Gmail requires 6 to 30 characters)
    if domain in ["gmail.com", "googlemail.com"]:
        if len(username) < 6:
            return False, "Gmail username must be at least 6 characters long."
        if len(username) > 30:
            return False, "Gmail username cannot exceed 30 characters."
    else:
        if len(username) < 4:
            return False, "Email username must be at least 4 characters long."

    # 3. Anti-gibberish / random keyboard-mash checks
    for pattern in KEYBOARD_PATTERNS:
        if pattern in username:
            return False, "Random or generated keyboard-mash email addresses are not permitted. Please use your genuine existing email."
            
    if re.search(r"(.)\1{4,}", username):
        return False, "Email address containing repetitive random characters is not permitted."

    if re.search(r"[bcdfghjklmnpqrstvwxyz]{6,}", username):
        return False, "Random unpronounceable email address detected. Please enter your real existing email address."

    return True, ""

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()
    except Exception:
        return None

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    clean_email = str(user_in.email).strip().lower()
    clean_name = user_in.full_name.strip()
    
    # Strict validation: genuine existing Gmail / institutional email only
    is_valid, reason = validate_citizen_email(clean_email)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason
        )
    
    result = await db.execute(select(User).filter(User.email == clean_email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account already exists with this email address. Please sign in instead."
        )
    
    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=clean_email,
        hashed_password=hashed_pwd,
        full_name=clean_name or "Citizen",
        role="USER"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create empty initial profile
    profile = UserProfile(user_id=new_user.id)
    db.add(profile)
    await db.commit()

    access_token = create_access_token(subject=new_user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        role=new_user.role
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    clean_email = str(credentials.email).strip().lower()
    result = await db.execute(select(User).filter(User.email == clean_email))
    user = result.scalars().first()
    
    # Strict validation: user must have registered first
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email. Please sign up first."
        )
    
    # Strict password verification
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your password or use 'Forgot password?' to reset.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact administrator support."
        )
    
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role
    )

@router.post("/forgot-password", response_model=AuthMessageResponse)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    clean_email = str(req.email).strip().lower()
    result = await db.execute(select(User).filter(User.email == clean_email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email address. Please check the spelling or create an account."
        )
    
    # Generate 6-digit OTP code
    otp = f"{random.randint(100000, 999999)}"
    OTP_STORE[clean_email] = (otp, time.time() + 600)  # 10 minutes expiry
    
    return AuthMessageResponse(
        status="success",
        message=f"A 6-digit password reset verification code has been generated for {clean_email}.",
        otp_preview=otp
    )

@router.post("/reset-password", response_model=AuthMessageResponse)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    clean_email = str(req.email).strip().lower()
    otp_input = req.otp.strip()
    
    result = await db.execute(select(User).filter(User.email == clean_email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email."
        )
    
    # Validate OTP
    stored_record = OTP_STORE.get(clean_email)
    valid_otp = False
    
    if stored_record:
        stored_otp, expiry = stored_record
        if time.time() < expiry and stored_otp == otp_input:
            valid_otp = True
    
    # Allow prototype test fallback
    if otp_input == "123456":
        valid_otp = True
        
    if not valid_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code (OTP). Please request a new code."
        )
    
    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )
        
    # Update password in SQLite database
    user.hashed_password = get_password_hash(req.new_password)
    await db.commit()
    await db.refresh(user)
    
    # Clear OTP
    OTP_STORE.pop(clean_email, None)
    
    return AuthMessageResponse(
        status="success",
        message="Your password has been successfully reset! You can now log in with your new password."
    )

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
