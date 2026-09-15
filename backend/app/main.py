from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.database.session import engine, Base, AsyncSessionLocal
from app.api import api_router
from app.models.scheme import (
    Scheme, 
    SchemeCategory, 
    SchemeBenefit, 
    SchemeDocument, 
    SchemeStep, 
    SchemeFAQ, 
    SchemeEligibilityRule
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Scheme))
        schemes = result.scalars().all()
        if not schemes:
            # Create categories
            c1 = SchemeCategory(name="Education & Scholarships", slug="education", description="Scholarships, tuition grants & student support", icon_name="GraduationCap")
            c2 = SchemeCategory(name="Agriculture & Farmers", slug="agriculture", description="Direct income support, crop insurance & subsidies", icon_name="Tractor")
            c3 = SchemeCategory(name="Healthcare & Wellness", slug="health", description="Health insurance & medical assistance", icon_name="HeartPulse")
            c4 = SchemeCategory(name="Women & Child Support", slug="women", description="Maternal care, female education & financial assistance", icon_name="Users")
            c5 = SchemeCategory(name="Senior Citizens & Pension", slug="seniors", description="Old age pension, security & healthcare for seniors", icon_name="UserCheck")
            c6 = SchemeCategory(name="Business & Entrepreneurship", slug="business", description="MUDRA loans, startup subsidies & credit links", icon_name="Briefcase")
            c7 = SchemeCategory(name="Housing & Shelter", slug="housing", description="PMAY pucca house subsidies & urban housing grants", icon_name="Home")

            db.add_all([c1, c2, c3, c4, c5, c6, c7])
            await db.commit()

            # Scheme 1: PM Overseas Scholarship
            s1 = Scheme(
                title="PM National Overseas Scholarship for Higher Education",
                short_description="Financial assistance for meritorious students belonging to eligible low-income categories pursuing Master's or Ph.D. degrees abroad.",
                detailed_description="Provides comprehensive financial support including tuition fees, maintenance allowance, contingency allowance, and airfare for pursuing higher education in top foreign universities.",
                category_id=c1.id,
                state="Central",
                ministry="Ministry of Social Justice and Empowerment",
                benefit_type="Scholarship",
                estimated_benefit_amount=1500000.0,
                benefit_summary="Full tuition fee + annual maintenance allowance of $15,400 USD",
                official_url="https://nosmsje.gov.in",
                application_mode="Online",
                processing_timeline_days=45
            )

            # Scheme 2: PM-KISAN
            s2 = Scheme(
                title="PM-KISAN Samman Nidhi Scheme",
                short_description="Direct income support of ₹6,000 per year in 3 equal installments for landholding farmer families.",
                detailed_description="Central sector scheme providing financial assistance to all landholding farmer families across India to meet agriculture-related input expenses.",
                category_id=c2.id,
                state="Central",
                ministry="Ministry of Agriculture & Farmers Welfare",
                benefit_type="Financial Support",
                estimated_benefit_amount=6000.0,
                benefit_summary="₹6,000 per year transferred directly to bank account in 3 installments of ₹2,000",
                official_url="https://pmkisan.gov.in",
                application_mode="Online",
                processing_timeline_days=15
            )

            # Scheme 3: Ayushman Bharat PM-JAY
            s3 = Scheme(
                title="Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                short_description="Health insurance coverage of up to ₹5 Lakh per family per year for secondary and tertiary hospitalization.",
                detailed_description="World's largest healthcare entitlement program providing cashless and paperless hospitalization treatment across 25,000+ empaneled hospitals.",
                category_id=c3.id,
                state="Central",
                ministry="Ministry of Health and Family Welfare",
                benefit_type="Healthcare Insurance",
                estimated_benefit_amount=500000.0,
                benefit_summary="Up to ₹5,00,000 annual cashless coverage per family floater",
                official_url="https://pmjay.gov.in",
                application_mode="Both",
                processing_timeline_days=7
            )

            # Scheme 4: Pudhumai Penn (Tamil Nadu)
            s4 = Scheme(
                title="Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)",
                short_description="Financial assistance of ₹1,000/month for female students from Tamil Nadu government schools pursuing higher education.",
                detailed_description="Empowers young women from government school backgrounds in Tamil Nadu to complete higher education degrees, diplomas, or ITI courses without dropping out.",
                category_id=c4.id,
                state="Tamil Nadu",
                ministry="Social Welfare and Women Empowerment Department",
                benefit_type="Monthly Financial Support",
                estimated_benefit_amount=12000.0,
                benefit_summary="₹1,000 per month deposited directly into bank account until graduation",
                official_url="https://penkalvi.tn.gov.in",
                application_mode="Online",
                processing_timeline_days=20
            )

            # Scheme 5: PM MUDRA Yojana
            s5 = Scheme(
                title="Pradhan Mantri MUDRA Yojana (PMMY)",
                short_description="Collateral-free micro-business loans up to ₹10 Lakh for non-corporate, non-farm small/micro enterprises.",
                detailed_description="Provides financial access to small business entrepreneurs under three categories: Shishu (up to ₹50,000), Kishore (₹50k-₹5L), and Tarun (₹5L-₹10L).",
                category_id=c6.id,
                state="Central",
                ministry="Ministry of Finance",
                benefit_type="Low-Interest Loan",
                estimated_benefit_amount=1000000.0,
                benefit_summary="Collateral-free loans up to ₹10,00,000 for business expansion",
                official_url="https://www.mudra.org.in",
                application_mode="Both",
                processing_timeline_days=30
            )

            # Scheme 6: IGNOAPS Pension
            s6 = Scheme(
                title="Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
                short_description="Monthly social pension for senior citizens aged 60+ living below the poverty line.",
                detailed_description="Provides monthly financial pension security to elderly citizens from BPL households across India.",
                category_id=c5.id,
                state="Central",
                ministry="Ministry of Rural Development",
                benefit_type="Monthly Pension",
                estimated_benefit_amount=12000.0,
                benefit_summary="₹1,000 - ₹1,500 monthly pension deposited directly to bank account",
                official_url="https://nsap.nic.in",
                application_mode="Both",
                processing_timeline_days=30
            )

            db.add_all([s1, s2, s3, s4, s5, s6])
            await db.commit()

            # Add nested detail relations for s1 (PM Overseas Scholarship)
            db.add_all([
                SchemeBenefit(scheme_id=s1.id, title="Tuition Fee Cover", description="100% actual tuition fee paid directly to university", amount_inr=1200000.0),
                SchemeBenefit(scheme_id=s1.id, title="Annual Maintenance Allowance", description="$15,400 USD maintenance grant per year", amount_inr=1250000.0),
                SchemeDocument(scheme_id=s1.id, document_type="Aadhaar Card", is_mandatory=True, description="Government issued identity proof"),
                SchemeDocument(scheme_id=s1.id, document_type="Income Certificate", is_mandatory=True, description="Family income must be below ₹8 Lakhs/year"),
                SchemeDocument(scheme_id=s1.id, document_type="Degree Certificate / Marksheets", is_mandatory=True, description="Minimum 60% marks in qualifying degree"),
                SchemeDocument(scheme_id=s1.id, document_type="Unconditional Admission Offer Letter", is_mandatory=True, description="From top 500 QS ranked university"),
                SchemeStep(scheme_id=s1.id, step_number=1, title="Register on NOS Portal", description="Create an applicant profile on nosmsje.gov.in portal", action_url="https://nosmsje.gov.in"),
                SchemeStep(scheme_id=s1.id, step_number=2, title="Upload Verified Certificates", description="Upload Aadhaar, Income certificate, degree transcripts, and admission letter"),
                SchemeStep(scheme_id=s1.id, step_number=3, title="Verification & Selection Committee Review", description="Application is reviewed by ministry expert panel"),
                SchemeFAQ(scheme_id=s1.id, question="What is the family income limit?", answer="Total family income from all sources must not exceed ₹8,00,000 per annum."),
                SchemeFAQ(scheme_id=s1.id, question="Which courses are eligible?", answer="Master's degree and Ph.D. programs in Science, Engineering, Medicine, Management, and Social Sciences.")
            ])

            # Add nested detail relations for s4 (Pudhumai Penn TN)
            db.add_all([
                SchemeBenefit(scheme_id=s4.id, title="Monthly Direct Transfer", description="₹1,000 deposited every month into student account", amount_inr=1000.0),
                SchemeDocument(scheme_id=s4.id, document_type="Aadhaar Card", is_mandatory=True, description="Student Aadhaar card linked with bank account"),
                SchemeDocument(scheme_id=s4.id, document_type="School Transfer Certificate / Bonafide", is_mandatory=True, description="Proof of 6th to 12th in TN government schools"),
                SchemeDocument(scheme_id=s4.id, document_type="College Admission ID / Bonafide", is_mandatory=True, description="Proof of enrollment in UG degree or diploma"),
                SchemeStep(scheme_id=s4.id, step_number=1, title="Verification by Government School Principal", description="School verifies student studied from Class 6 to 12 in TN Govt school"),
                SchemeStep(scheme_id=s4.id, step_number=2, title="College Nodal Officer Approval", description="College verifies current active attendance"),
                SchemeStep(scheme_id=s4.id, step_number=3, title="Direct Benefit Transfer (DBT)", description="Funds credited on the 10th of every month"),
                SchemeFAQ(scheme_id=s4.id, question="Are private school students eligible?", answer="No, this scheme is specifically for students who studied from Class 6 to 12 in Tamil Nadu Government schools."),
                SchemeFAQ(scheme_id=s4.id, question="Can I receive this along with other scholarships?", answer="Yes, students receiving academic merit scholarships can still receive Pudhumai Penn benefits.")
            ])

            # Seed Location Support Centers
            from app.models.location import Location
            l1 = Location(
                name="E-Sevai Maiyam (CSC) - Guindy",
                type="CSC_CENTER",
                state="Tamil Nadu",
                district="Chennai",
                taluk="Guindy",
                address="12, Race Course Road, Guindy, Chennai - 600032",
                phone="+91 44 2235 1100",
                email="esevai.guindy@tn.gov.in",
                latitude=13.0067,
                longitude=80.2081,
                source_url="https://tnesevai.tn.gov.in",
                verified=True
            )
            l2 = Location(
                name="Social Welfare Department Office - Egmore",
                type="GOVT_OFFICE",
                state="Tamil Nadu",
                district="Chennai",
                taluk="Egmore",
                address="Panagal Building, Egmore, Chennai - 600008",
                phone="+91 44 2819 4500",
                email="socialwelfare.chn@tn.gov.in",
                latitude=13.0732,
                longitude=80.2609,
                source_url="https://tn.gov.in/socialwelfare",
                verified=True
            )
            l3 = Location(
                name="Bangalore One Service Centre - Koramangala",
                type="CSC_CENTER",
                state="Karnataka",
                district="Bengaluru Urban",
                taluk="Koramangala",
                address="80 Feet Road, 4th Block, Koramangala, Bengaluru - 560034",
                phone="+91 80 2553 9900",
                email="help@bangaloreone.gov.in",
                latitude=12.9352,
                longitude=77.6245,
                source_url="https://karnatakaone.gov.in",
                verified=True
            )
            db.add_all([l1, l2, l3])
            await db.commit()

        # Seed Demo Admin Accounts if missing
        from app.models.user import User
        from app.core.security import get_password_hash
        admin_res = await db.execute(select(User).filter(User.email == "admin@sathyamithra.gov.in"))
        if not admin_res.scalars().first():
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

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers & Correlation ID Middleware
import uuid
from fastapi import Request

@app.middleware("http")
async def add_security_headers_and_correlation_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:10]}"
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "tagline": "Honest Guide to Every Benefit You Deserve"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "connected", "redis": "connected"}

