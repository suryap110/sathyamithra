from typing import List
from fastapi import Depends, HTTPException, status
from app.api.auth import get_current_user
from app.models.user import User

def require_roles(allowed_roles: List[str]):
    """
    Dependency factory to restrict endpoint access based on user roles.
    Allowed roles: USER, ADMIN, CONTENT_EDITOR, SUPPORT_AGENT, COMMUNITY_MODERATOR
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account"
            )
        
        # ADMIN has unrestricted access across all admin modules
        if current_user.role == "ADMIN":
            return current_user
            
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not authorized to access this resource"
            )
        return current_user
    return role_checker

# Helper shortcuts for cleaner router signatures
require_admin = require_roles(["ADMIN"])
require_editor_or_admin = require_roles(["ADMIN", "CONTENT_EDITOR"])
require_moderator_or_admin = require_roles(["ADMIN", "COMMUNITY_MODERATOR"])
require_support_or_admin = require_roles(["ADMIN", "SUPPORT_AGENT"])
require_any_admin_role = require_roles(["ADMIN", "CONTENT_EDITOR", "COMMUNITY_MODERATOR", "SUPPORT_AGENT"])
