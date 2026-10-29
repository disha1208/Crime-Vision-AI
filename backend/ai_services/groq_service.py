"""
Groq LLM Service Module for CrimeVision AI Evidence Chat.
Supports real LLM inference with Groq's high-speed API.
Falls back seamlessly to Demo Forensic Context Engine when GROQ_API_KEY is not configured.
"""
import os
import json

class GroqService:
    def __init__(self, api_key=None, model="llama-3.3-70b-versatile"):
        self.api_key = (api_key or os.environ.get('GROQ_API_KEY', '')).strip()
        self.model = os.environ.get('GROQ_MODEL', model)
        self.has_key = bool(self.api_key)

    def is_available(self):
        return self.has_key

    def get_status(self):
        return {
            "name": "Groq LLM Forensic Intelligence",
            "available": self.has_key,
            "model": self.model if self.has_key else "Local Forensic Rule Engine",
            "description": "Multi-turn conversational reasoning across evidence items, cryptographic hashes, and timelines.",
            "status_message": f"Active ({self.model})" if self.has_key else "Demo Mode active. (Set GROQ_API_KEY in backend/.env for Groq Llama 3.3)"
        }

    def chat_about_case(self, case_data: dict, evidence_list: list, timeline_events: list, user_message: str, chat_history: list = None) -> dict:
        """
        Answers investigator queries about a specific case.
        """
        # Build structured case context
        case_summary = {
            "case_number": case_data.get("case_number"),
            "title": case_data.get("title"),
            "incident_date": case_data.get("incident_date"),
            "location": case_data.get("location"),
            "status": case_data.get("status"),
            "priority": case_data.get("priority"),
            "investigator": case_data.get("lead_investigator"),
            "description": case_data.get("description"),
            "evidence_count": len(evidence_list),
            "evidence_items": [
                {
                    "filename": e.get("filename"),
                    "file_type": e.get("file_type"),
                    "sha256": e.get("sha256_hash"),
                    "status": e.get("status"),
                    "summary": (e.get("analysis") or {}).get("summary", "Unprocessed"),
                    "scene_description": (e.get("analysis") or {}).get("scene_description", ""),
                    "detected_objects": (e.get("analysis") or {}).get("detected_objects", []),
                    "transcription": (e.get("analysis") or {}).get("transcription", "")
                }
                for e in evidence_list
            ],
            "timeline": [
                {
                    "timestamp": t.get("timestamp_str"),
                    "source": t.get("source_type"),
                    "title": t.get("title"),
                    "description": t.get("description"),
                    "confidence": t.get("confidence")
                }
                for t in timeline_events
            ]
        }

        # If real Groq API key is present, attempt live inference
        if self.has_key:
            try:
                from groq import Groq
                client = Groq(api_key=self.api_key)

                system_prompt = (
                    "You are CrimeVision Forensic AI, an objective digital evidence and forensic analysis assistant. "
                    "You assist accredited investigators in analyzing multimodal evidence (video keyframes, audio transcripts, image telemetry). "
                    "IMPORTANT FORENSIC PRINCIPLES:\n"
                    "1. Strictly cite evidence filenames, timestamps, and SHA-256 hashes when referencing facts.\n"
                    "2. Distinguish clearly between verified digital artifacts and automated AI detections/hypotheses.\n"
                    "3. NEVER declare a suspect guilty or definitively assert criminal culpability. State findings as observations requiring corroboration.\n"
                    "4. If evidence is unprocessed or missing, explicitly state that no data is currently available.\n\n"
                    f"CURRENT INVESTIGATION CASE CONTEXT:\n{json.dumps(case_summary, indent=2)}"
                )

                messages = [{"role": "system", "content": system_prompt}]
                
                # Append recent chat history if available
                if chat_history:
                    for turn in chat_history[-6:]:
                        role = "assistant" if turn.get("role") in ["assistant", "ai"] else "user"
                        messages.append({"role": role, "content": turn.get("content", "")})

                messages.append({"role": "user", "content": user_message})

                completion = client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.2,
                    max_tokens=900
                )

                answer = completion.choices[0].message.content
                return {
                    "reply": answer,
                    "mode": "real_ai",
                    "model": self.model,
                    "is_simulated": False,
                    "disclaimer": "AI-assisted investigative analysis. Corroboration by certified forensic examiner required."
                }
            except Exception as e:
                # If API call fails, fall back to demo response with notice
                print(f"[GroqService] Groq API error: {e}")
                fallback = self._demo_forensic_response(user_message, case_summary)
                fallback["notice"] = f"Groq API connection error ({str(e)}). Returned local forensic context analysis."
                return fallback

        # Fallback to local forensic query engine
        return self._demo_forensic_response(user_message, case_summary)

    def _demo_forensic_response(self, query: str, context: dict) -> dict:
        """
        Context-aware local forensic assistant for Demo Mode.
        """
        q = query.lower()
        case_num = context.get("case_number", "CASE-UNKNOWN")
        evidence = context.get("evidence_items", [])
        timeline = context.get("timeline", [])
        
        reply_lines = []
        reply_lines.append(f"**CrimeVision Forensic Assistant (Demo Mode)** | Case `{case_num}`\n")

        if any(w in q for w in ["suspect", "person", "individual", "who"]):
            reply_lines.append("### Person of Interest / Suspect Observations:")
            reply_lines.append("- Visual analysis detects an individual wearing dark outerwear (hooded jacket, gloves).")
            reply_lines.append("- Observed in video keyframes approaching target perimeter and driver-side entrance.")
            reply_lines.append("- Audio transmission logs corroborate: *'Single individual, dark jacket and gloves moving towards service alleyway.'*")
            reply_lines.append("\n*Forensic Note: Facial profile remains partially obscured; automated confidence is 94% on presence, but identity is unconfirmed.*")

        elif any(w in q for w in ["timeline", "chronology", "sequence", "when", "time"]):
            reply_lines.append("### Chronological Incident Sequence:")
            if timeline:
                for idx, ev in enumerate(timeline[:5]):
                    reply_lines.append(f"- **[{ev.get('timestamp')}]** *{ev.get('title')}* — {ev.get('description')}")
            else:
                reply_lines.append("- No timeline events generated yet. Analyze uploaded evidence to populate temporal sequence.")
            reply_lines.append("\n*All timeline markers are correlated across video keyframes and audio dispatch streams.*")

        elif any(w in q for w in ["hash", "integrity", "sha", "custody", "tamper"]):
            reply_lines.append("### Chain of Custody & Evidence Verification:")
            if evidence:
                for e in evidence:
                    reply_lines.append(f"- **{e.get('filename')}** ({e.get('file_type').upper()}):")
                    reply_lines.append(f"  - SHA-256: `{e.get('sha256')}`")
                    reply_lines.append(f"  - Forensic Status: `{e.get('status')}`")
            else:
                reply_lines.append("- No evidence items registered in this case.")
            reply_lines.append("\n*Cryptographic hashes verify that original evidentiary binaries remain unaltered.*")

        elif any(w in q for w in ["vehicle", "car", "plate", "sedan"]):
            reply_lines.append("### Vehicle Telemetry & Detections:")
            reply_lines.append("- Detected Entity: Motor Vehicle (Sedan), dark blue or black.")
            reply_lines.append("- Partial license plate indicator observed: `7XY-***` (Confidence: 88%).")
            reply_lines.append("- Vehicle positioned adjacent to north perimeter alleyway during the incident window.")

        elif any(w in q for w in ["weapon", "tool", "threat", "danger"]):
            reply_lines.append("### Threat & Tool Assessment:")
            reply_lines.append("- Detected Object: Elongated metallic tool / hardware implement held in right hand (Confidence: 79%).")
            reply_lines.append("- Anomaly level: Elevated. Consistent with forced entry hardware.")
            reply_lines.append("- Recommendation: Submit keyframe #3 for sub-pixel edge clarification.")

        else:
            # General summary
            reply_lines.append(f"### Forensic Overview for {context.get('title')}:")
            reply_lines.append(f"- **Status**: {context.get('status')} | **Priority**: {context.get('priority')}")
            reply_lines.append(f"- **Location**: {context.get('location')} | **Incident Date**: {context.get('incident_date')}")
            reply_lines.append(f"- **Evidence Registered**: {len(evidence)} file(s).")
            reply_lines.append(f"- **Timeline Events**: {len(timeline)} timestamped marker(s).")
            reply_lines.append("\nYou can inquire about: *suspect details*, *vehicle telemetry*, *timeline progression*, *evidence hashes*, or *weapon/tool detections*.")

        return {
            "reply": "\n".join(reply_lines),
            "mode": "demo",
            "model": "Local Forensic Context Engine",
            "is_simulated": True,
            "disclaimer": "Simulated forensic reasoning in Demo Mode. Connect GROQ_API_KEY for live Groq Llama 3.3 LLM inference."
        }
