from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import get_password_hash
from backend.models.user import User, UserRole
from backend.schemas.user import UserResponse, UserUpdate
from backend.routers.deps import require_admin, get_current_user

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("", response_model=List[UserResponse])
def get_users(
    search: Optional[str] = Query(None, description="Cari nama atau email"),
    role: Optional[UserRole] = Query(None, description="Filter berdasarkan role"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(User)
    if search:
        search_filter = f"%{search}%"
        query = query.filter((User.name.ilike(search_filter)) | (User.email.ilike(search_filter)))
    if role:
        query = query.filter(User.role == role)
    
    return query.order_by(User.id.desc()).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses ditolak")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        # Prevent self-deactivation
        if user.id == admin.id and not user_update.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Anda tidak dapat menonaktifkan akun admin Anda sendiri.")
        user.is_active = user_update.is_active
    if user_update.password:
        user.hashed_password = get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Anda tidak dapat menghapus akun Anda sendiri.")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    
    db.delete(user)
    db.commit()
    return {"message": f"Pengguna {user.email} berhasil dihapus"}

