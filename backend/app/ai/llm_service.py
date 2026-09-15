# -*- coding: utf-8 -*-
from typing import Dict, Any, List
import re
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.retriever import retrieve_relevant_schemes
from app.ai.guardrails import get_disclaimer, sanitize_user_input
from app.services.eligibility_engine import evaluate_scheme_eligibility
from app.schemas.scheme import SchemeSchema

def _detect_intent(query: str) -> str:
    q = query.lower()
    if any(k in q for k in ["document", "proof", "paper", "aadhaar", "certificate", "ஆவணம்", "சான்றிதழ்", "दस्तावेज़", "कागजात"]):
        return "documents"
    if any(k in q for k in ["apply", "application", "process", "portal", "step", "how to", "விண்ணப்பிக்க", "முறை", "आवेदन", "प्रक्रिया"]):
        return "apply_steps"
    if any(k in q for k in ["eligible", "eligibility", "criteria", "income", "age", "who can", "தகுதி", "पात्रता"]):
        return "eligibility"
    if any(k in q for k in ["benefit", "money", "amount", "pension", "scholarship", "பயன்", "தொகை", "लाभ", "राशि"]):
        return "benefits"
    if any(k in q for k in ["compare", "difference", "versus", "vs", "ஒப்பீடு", "तुलना"]):
        return "compare"
    return "general"

async def process_assistant_chat(
    user_query: str, 
    profile_dict: Dict[str, Any], 
    language: str, 
    db: AsyncSession
) -> Dict[str, Any]:
    sanitized_query = sanitize_user_input(user_query)
    intent = _detect_intent(sanitized_query)
    
    # Retrieve grounded schemes from RAG vector store
    retrieved_docs = await retrieve_relevant_schemes(sanitized_query, db, top_k=5)
    
    matched_schemes = []
    sources = []
    related_scheme_dtos = []

    for doc in retrieved_docs:
        scheme_obj = doc["scheme_obj"]
        match_eval = evaluate_scheme_eligibility(scheme_obj, profile_dict)
        
        sources.append({
            "scheme_name": doc["scheme_name"],
            "ministry": doc["ministry"],
            "state": doc["state"],
            "source_url": doc["source_url"],
            "last_verified": doc["last_verified"],
            "confidence": match_eval.confidence_level
        })

        related_scheme_dtos.append(SchemeSchema.model_validate(scheme_obj))
        matched_schemes.append((scheme_obj, match_eval))

    user_name = profile_dict.get("full_name", "Citizen").split()[0]
    user_state = profile_dict.get("state", "India")
    user_occ = profile_dict.get("occupation", "citizen")

    if not matched_schemes:
        if language == "ta":
            answer = f"வணக்கம் {user_name}. உங்கள் கேள்விக்கு நேரடியாக பொருத்தமான அதிகாரப்பூர்வ திட்டங்கள் எதுவும் எங்களது தரவுத்தளத்தில் கண்டறியப்படவில்லை. தயவுசெய்து திட்டங்களின் பெயரை நேரடியாகத் தேடவும்."
        elif language == "hi":
            answer = f"नमस्ते {user_name}। आपकी खोज के अनुसार हमारे सत्यापित डेटाबेस में कोई योजना नहीं मिली। कृपया कीवर्ड बदलकर प्रयास करें।"
        else:
            answer = f"Hello {user_name}. No exact scheme matches found in our verified database for '{user_query}'. Please try searching by specific keywords or categories."
        
        return {
            "answer": answer,
            "language": language,
            "sources": [],
            "related_schemes": [],
            "confidence": 0.50,
            "disclaimer": get_disclaimer(language)
        }

    top_s, top_eval = matched_schemes[0]

    # Grounded Generator based on Intent & Language
    if intent == "documents":
        if language == "ta":
            answer = f"வணக்கம் {user_name}. **{top_s.title}** திட்டத்திற்குத் தேவையான அதிகாரப்பூர்வ ஆவணங்கள் கீழே பட்டியலிடப்பட்டுள்ளன:\n\n"
            if top_s.required_documents:
                for doc_item in top_s.required_documents:
                    req_str = "கட்டாயம்" if doc_item.is_mandatory else "விருப்பத் தேர்வு"
                    answer += f"• **{doc_item.document_type}** ({req_str}): {doc_item.description or ''}\n"
            else:
                answer += "• ஆதார் அட்டை (Aadhaar Card)\n• வருமானச் சான்றிதழ் (Income Certificate)\n• வங்கி கணக்கு விவரங்கள் (Bank Passbook)\n"
            answer += f"\nஅதிகாரப்பூர்வ தளம்: {top_s.official_url or 'https://myscheme.gov.in'}"
        
        elif language == "hi":
            answer = f"नमस्ते {user_name}। **{top_s.title}** के लिए आवश्यक आधिकारिक दस्तावेज़ नीचे दिए गए हैं:\n\n"
            if top_s.required_documents:
                for doc_item in top_s.required_documents:
                    req_str = "अनिवार्य" if doc_item.is_mandatory else "वैल्पिक"
                    answer += f"• **{doc_item.document_type}** ({req_str}): {doc_item.description or ''}\n"
            else:
                answer += "• आधार कार्ड (Aadhaar Card)\n• आय प्रमाण पत्र (Income Certificate)\n• बैंक खाता विवरण\n"
            answer += f"\nआधिकारिक पोर्टल: {top_s.official_url or 'https://pmkisan.gov.in'}"

        else: # English
            answer = f"Hello {user_name}. Here are the verified required documents for **{top_s.title}**:\n\n"
            if top_s.required_documents:
                for doc_item in top_s.required_documents:
                    req_str = "Mandatory" if doc_item.is_mandatory else "Optional"
                    answer += f"• **{doc_item.document_type}** ({req_str}): {doc_item.description or 'Official government proof'}\n"
            else:
                answer += "• **Aadhaar Card**: Government identity & address proof\n• **Income Certificate**: Verified by competent authority\n• **Bank Account Details**: Active Aadhaar-seeded bank account\n"
            answer += f"\nOfficial Application Portal: {top_s.official_url or 'https://myscheme.gov.in'}"

    elif intent == "apply_steps":
        if language == "ta":
            answer = f"வணக்கம் {user_name}. **{top_s.title}** திட்டத்திற்கு விண்ணப்பிக்கும் முறை (விண்ணப்ப முறை: {top_s.application_mode}):\n\n"
            if top_s.application_steps:
                for st in top_s.application_steps:
                    answer += f"**படி {st.step_number}: {st.title}**\n{st.description or ''}\n\n"
            else:
                answer += f"1. அதிகாரப்பூர்வ தளத்திற்கு செல்லவும்: {top_s.official_url or 'https://myscheme.gov.in'}\n2. பதிவு செய்து தேவைப்படும் ஆவணங்களை பதிவேற்றவும்.\n3. சரிபார்ப்புக்கு பின் நிதி வழங்கப்படும்.\n"
        
        elif language == "hi":
            answer = f"नमस्ते {user_name}। **{top_s.title}** के लिए आवेदन करने के चरण ({top_s.application_mode}):\n\n"
            if top_s.application_steps:
                for st in top_s.application_steps:
                    answer += f"**चरण {st.step_number}: {st.title}**\n{st.description or ''}\n\n"
            else:
                answer += f"1. आधिकारिक पोर्टल पर जाएं: {top_s.official_url or 'https://myscheme.gov.in'}\n2. आवेदन पत्र भरें और दस्तावेज़ जमा करें।\n"

        else: # English
            answer = f"Hello {user_name}. Here is the step-by-step application process for **{top_s.title}** (Mode: {top_s.application_mode or 'Online'}):\n\n"
            if top_s.application_steps:
                for st in top_s.application_steps:
                    answer += f"**Step {st.step_number}: {st.title}**\n{st.description or ''}\n\n"
            else:
                answer += f"1. Visit the official portal: [{top_s.official_url or 'https://myscheme.gov.in'}]({top_s.official_url or 'https://myscheme.gov.in'})\n2. Fill out the application form with accurate personal & bank details.\n3. Upload required verified documents and submit for departmental review.\n"
            answer += f"Expected Processing Time: {top_s.processing_timeline_days or 30} days."

    elif intent == "eligibility":
        matched_reasons = [r.details for r in top_eval.reasons if r.matched]
        unmet_reasons = [r.details for r in top_eval.reasons if not r.matched]

        if language == "ta":
            answer = f"வணக்கம் {user_name}. **{top_s.title}** திட்டத்திற்கான தகுதி வரம்புகள்:\n\n"
            answer += f"• **மாநிலம் / எல்லை:** {top_s.state}\n"
            answer += f"• **தகுதி பொருத்தம்:** {top_eval.match_percentage}%\n"
            if matched_reasons:
                answer += "\n**பூர்த்தியான தகுதிகள்:**\n" + "\n".join([f"✓ {c}" for c in matched_reasons])
            if unmet_reasons:
                answer += "\n\n**பூர்த்தியாகாத தகுதிகள்:**\n" + "\n".join([f"✗ {c}" for c in unmet_reasons])
        
        elif language == "hi":
            answer = f"नमस्ते {user_name}। **{top_s.title}** के लिए पात्रता मानदंड:\n\n"
            answer += f"• **राज्य:** {top_s.state}\n"
            answer += f"• **पात्रता मैच:** {top_eval.match_percentage}%\n"
            if matched_reasons:
                answer += "\n**संतुष्ट मानदंड:**\n" + "\n".join([f"✓ {c}" for c in matched_reasons])
            if unmet_reasons:
                answer += "\n\n**अपूर्ण मानदंड:**\n" + "\n".join([f"✗ {c}" for c in unmet_reasons])

        else: # English
            answer = f"Hello {user_name}. Here is the detailed eligibility breakdown for **{top_s.title}**:\n\n"
            answer += f"• **Scope:** {top_s.state} ({top_s.ministry or 'Government'})\n"
            answer += f"• **Your Profile Fit:** {top_eval.match_percentage}% Match (Confidence: {top_eval.confidence_level})\n\n"
            if matched_reasons:
                answer += "**Satisfied Criteria:**\n" + "\n".join([f"✓ {c}" for c in matched_reasons]) + "\n\n"
            if unmet_reasons:
                answer += "**Unmet / Pending Criteria:**\n" + "\n".join([f"✗ {c}" for c in unmet_reasons]) + "\n\n"
            if top_eval.warnings:
                answer += f"⚠️ **Verification Alert:** {top_eval.warnings[0]}"

    elif intent == "benefits":
        if language == "ta":
            answer = f"வணக்கம் {user_name}. **{top_s.title}** திட்டத்தின் பலன்கள்:\n\n"
            answer += f"**சுருக்கம்:** {top_s.benefit_summary or 'அரசு நேரடி உதவி'}\n\n"
            if top_s.benefits:
                for b in top_s.benefits:
                    answer += f"• **{b.title}**: {b.description or ''}\n"
        
        elif language == "hi":
            answer = f"नमस्ते {user_name}। **{top_s.title}** के प्रमुख लाभ:\n\n"
            answer += f"**सारांश:** {top_s.benefit_summary or 'सरकारी प्रत्यक्ष लाभ'}\n\n"
            if top_s.benefits:
                for b in top_s.benefits:
                    answer += f"• **{b.title}**: {b.description or ''}\n"

        else: # English
            answer = f"Hello {user_name}. Here are the benefits provided under **{top_s.title}**:\n\n"
            answer += f"**Benefit Summary:** {top_s.benefit_summary or 'Direct Financial / Welfare Support'}\n\n"
            if top_s.benefits:
                for b in top_s.benefits:
                    answer += f"• **{b.title}**: {b.description or ''} (Value: INR {b.amount_inr:,.0f} if applicable)\n"

    elif intent == "compare":
        if language == "ta":
            answer = f"வணக்கம் {user_name}. ஒப்பிடப்பட்ட அரசுத் திட்டங்கள்:\n\n"
            for sc, ev in matched_schemes[:3]:
                answer += f"### {sc.title}\n• **அமைச்சகம் / மாநிலம்:** {sc.state}\n• **நன்மை:** {sc.benefit_summary}\n• **தகுதி பொருத்தம்:** {ev.match_percentage}%\n\n"
        
        elif language == "hi":
            answer = f"नमस्ते {user_name}। योजनाओं की तुलना:\n\n"
            for sc, ev in matched_schemes[:3]:
                answer += f"### {sc.title}\n• **राज्य / मंत्रालय:** {sc.state}\n• **लाभ:** {sc.benefit_summary}\n• **पात्रता मैच:** {ev.match_percentage}%\n\n"

        else: # English
            answer = f"Hello {user_name}. Here is a comparison of top matching schemes for your query:\n\n"
            for sc, ev in matched_schemes[:3]:
                answer += f"### {sc.title}\n"
                answer += f"• **Scope:** {sc.state} | {sc.ministry or 'Government'}\n"
                answer += f"• **Benefit:** {sc.benefit_summary or 'Financial / Welfare Assistance'}\n"
                answer += f"• **Eligibility Fit:** {ev.match_percentage}%\n"
                answer += f"• **Mode:** {sc.application_mode}\n\n"

    else: # General
        if language == "ta":
            answer = f"வணக்கம் {user_name}. "
            answer += f"உங்கள் சுயவிவரத்தின்படி ({user_state}, {user_occ}), **{top_s.title}** திட்டம் மிகவும் பொருத்தமானது ({top_eval.match_percentage}% தகுதி).\n\n"
            answer += f"**விளக்கம்:** {top_s.short_description}\n\n"
            answer += f"**மதிப்பிடப்பட்ட நன்மை:** {top_s.benefit_summary or 'அரசு உதவி'}\n"
            if top_eval.warnings:
                answer += f"\n⚠️ **குறிப்பு:** {top_eval.warnings[0]}"
        elif language == "hi":
            answer = f"नमस्ते {user_name}। "
            answer += f"आपकी प्रोफ़ाइल ({user_state}, {user_occ}) के अनुसार **{top_s.title}** आपके लिए उपयुक्त है ({top_eval.match_percentage}% पात्रता Match)।\n\n"
            answer += f"**विवरण:** {top_s.short_description}\n\n"
            answer += f"**अनुमानित लाभ:** {top_s.benefit_summary or 'सरकारी सहायता'}\n"
            if top_eval.warnings:
                answer += f"\n⚠️ **ध्यान दें:** {top_eval.warnings[0]}"
        else: # English
            answer = f"Hello {user_name}. Based on your profile in {user_state} as a {user_occ}, **{top_s.title}** is a strong match ({top_eval.match_percentage}% eligibility fit).\n\n"
            answer += f"**Overview:** {top_s.short_description}\n\n"
            if top_s.benefit_summary:
                answer += f"**Estimated Benefit:** {top_s.benefit_summary}\n"
            if top_eval.warnings:
                answer += f"\n⚠️ **Verification Note:** {top_eval.warnings[0]}"

    return {
        "answer": answer,
        "language": language,
        "sources": sources[:3],
        "related_schemes": related_scheme_dtos[:3],
        "confidence": 0.95 if matched_schemes else 0.60,
        "disclaimer": get_disclaimer(language)
    }
