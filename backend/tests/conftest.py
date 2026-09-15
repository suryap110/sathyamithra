import pytest
import pytest_asyncio
from sqlalchemy.future import select
from app.database.session import engine, Base, AsyncSessionLocal
from app.models.scheme import Scheme, SchemeCategory

@pytest_asyncio.fixture(autouse=True, scope="function")
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        c1 = SchemeCategory(name="Education & Scholarships", slug="education", description="Scholarships", icon_name="GraduationCap")
        c2 = SchemeCategory(name="Agriculture & Farmers", slug="agriculture", description="Farmer support", icon_name="Tractor")
        db.add_all([c1, c2])
        await db.commit()

        s1 = Scheme(
            title="PM National Overseas Scholarship",
            short_description="Financial assistance for overseas studies.",
            category_id=c1.id,
            state="Central",
            ministry="Ministry of Social Justice",
            benefit_type="Scholarship",
            estimated_benefit_amount=1500000.0,
            benefit_summary="Full tuition fee + allowance"
        )
        s2 = Scheme(
            title="Pudhumai Penn Scheme",
            short_description="TN state scholarship for female students.",
            category_id=c1.id,
            state="Tamil Nadu",
            ministry="Social Welfare Department",
            benefit_type="Monthly Financial Support",
            estimated_benefit_amount=12000.0,
            benefit_summary="₹1,000 per month"
        )
        db.add_all([s1, s2])
        await db.commit()

        # Seed admin users for test suite
        from app.models.user import User
        from app.core.security import get_password_hash
        admin_user = User(
            email="admin@sathyamithra.gov.in",
            hashed_password=get_password_hash("Admin@12345"),
            full_name="System Administrator",
            role="ADMIN"
        )
        editor_user = User(
            email="editor@sathyamithra.gov.in",
            hashed_password=get_password_hash("Editor@12345"),
            full_name="Content Editor",
            role="CONTENT_EDITOR"
        )
        mod_user = User(
            email="moderator@sathyamithra.gov.in",
            hashed_password=get_password_hash("Moderator@12345"),
            full_name="Community Moderator",
            role="COMMUNITY_MODERATOR"
        )
        db.add_all([admin_user, editor_user, mod_user])
        await db.commit()

    yield
