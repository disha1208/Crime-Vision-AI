import os
import cv2
import json
import uuid
from pathlib import Path
from datetime import datetime

class DemoEngine:
    @staticmethod
    def analyze_image(file_path: str, filename: str, frames_dir: Path) -> dict:
        """
        Forensic Image Analysis in Demo Mode:
        Uses OpenCV to read actual resolution and properties, then generates
        realistic, clearly labeled simulated detections and scene descriptions.
        """
        width, height = 1920, 1080
        brightness = 128.0
        contrast = 50.0

        try:
            img = cv2.imread(file_path)
            if img is not None:
                height, width = img.shape[:2]
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                brightness = float(gray.mean())
                contrast = float(gray.std())
        except Exception as e:
            print(f"[DemoEngine] OpenCV image read note: {e}")

        # Simulated detections mapped realistically to the actual image resolution
        sample_detections = [
            {
                "id": "det-1",
                "label": "Person / Suspect",
                "category": "Person of Interest",
                "confidence": 0.94,
                "bbox": [int(width * 0.22), int(height * 0.15), int(width * 0.35), int(height * 0.75)],
                "attributes": {"clothing": "Dark hooded jacket, gloves", "face_visible": False}
            },
            {
                "id": "det-2",
                "label": "Motor Vehicle (Sedan)",
                "category": "Vehicle",
                "confidence": 0.88,
                "bbox": [int(width * 0.55), int(height * 0.38), int(width * 0.40), int(height * 0.45)],
                "attributes": {"color": "Dark blue / black", "plate_visible": True, "partial_plate": "7XY-***"}
            },
            {
                "id": "det-3",
                "label": "Concealed Object / Hardware Tool",
                "category": "Potential Weapon / Tool",
                "confidence": 0.79,
                "bbox": [int(width * 0.32), int(height * 0.58), int(width * 0.12), int(height * 0.18)],
                "attributes": {"shape": "Elongated metallic tool", "anomaly_score": "High"}
            }
        ]

        lighting_assessment = (
            "Low-light / Night-time surveillance conditions" if brightness < 80
            else "Standard daylight illumination" if brightness < 180
            else "High-exposure / Direct sunlight"
        )

        scene_desc = (
            f"Forensic surveillance frame ({width}x{height} px). {lighting_assessment} with contrast index of {contrast:.1f}. "
            "A person of interest wearing dark outerwear is observed in proximity to an unidentified sedan. "
            "Handheld object detected with high anomalous interest near the driver's side entrance."
        )

        risk_assessment = {
            "threat_level": "Elevated",
            "anomalies_detected": ["Concealed tool detected", "Obscured facial profile", "Partial vehicle registration"],
            "forensic_flags": ["Chain of custody intact", "Resolution adequate for license plate deblurring enhancement"]
        }

        summary = (
            f"Image analysis processed {len(sample_detections)} distinct forensic entities. "
            f"Detected person of interest (94% confidence) and suspicious vehicle (88% confidence)."
        )

        return {
            "analysis_mode": "demo",
            "model_used": "Forensic Demo Engine (RT-DETR & BLIP Simulated)",
            "summary": summary,
            "scene_description": scene_desc,
            "detected_objects": sample_detections,
            "transcription": "",
            "audio_segments": [],
            "video_frames": [],
            "risk_assessment": risk_assessment,
            "is_simulated": True
        }

    @staticmethod
    def analyze_video(file_path: str, filename: str, frames_dir: Path, sample_interval_sec: float = 3.0) -> dict:
        """
        Forensic Video Analysis in Demo Mode:
        Uses OpenCV to read actual FPS, frame count, duration, and extracts real preview frames
        saved to the frames directory, creating timestamped events for the timeline.
        """
        extracted_frames = []
        timeline_events = []
        fps = 30.0
        frame_count = 0
        duration_sec = 15.0
        width, height = 1920, 1080

        try:
            cap = cv2.VideoCapture(file_path)
            if cap.isOpened():
                fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1920
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 1080
                duration_sec = max(frame_count / fps, 1.0) if frame_count > 0 else 12.0

                # Sample up to 6 keyframes
                num_samples = min(6, max(3, int(duration_sec / sample_interval_sec)))
                step_frames = max(1, int(frame_count / num_samples)) if frame_count > 0 else 30

                sample_narratives = [
                    ("Subject enters perimeter via north parking lot alleyway.", "Person Detected", 0.93),
                    ("Subject approaches target vehicle; looks around security perimeter.", "Suspicious Movement", 0.89),
                    ("Subject interacts with driver-side window using handheld device/tool.", "Forced Entry Attempt", 0.86),
                    ("Vehicle lights flash briefly; subject opens door and reaches inside.", "Breach Confirmed", 0.95),
                    ("Subject withdraws with duffel bag and departs eastbound on foot.", "Exit & Transport", 0.91),
                    ("Scene clear; secondary vehicle passes through 45 seconds later.", "Post-Incident Traffic", 0.78)
                ]

                for idx in range(num_samples):
                    target_frame_num = idx * step_frames
                    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_num)
                    ret, frame = cap.read()
                    
                    frame_filename = f"frame_{uuid.uuid4().hex[:8]}_{idx}.jpg"
                    frame_save_path = frames_dir / frame_filename
                    
                    if ret and frame is not None:
                        # Save thumbnail
                        cv2.imwrite(str(frame_save_path), frame)
                    else:
                        # Create synthetic visual placeholder frame with OpenCV
                        import numpy as np
                        synthetic_img = np.zeros((360, 640, 3), dtype=np.uint8)
                        synthetic_img[:] = (26, 20, 15)  # Dark navy forensic tone
                        cv2.putText(synthetic_img, f"CRIMEVISION FRAME {idx+1}", (30, 160), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 212, 255), 2)
                        cv2.putText(synthetic_img, f"Time: 00:00:{idx*3:02d}", (30, 210), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 1)
                        cv2.imwrite(str(frame_save_path), synthetic_img)

                    timestamp_sec = idx * (duration_sec / num_samples)
                    mins = int(timestamp_sec // 60)
                    secs = int(timestamp_sec % 60)
                    time_str = f"{mins:02d}:{secs:02d}"

                    narrative, title, conf = sample_narratives[idx % len(sample_narratives)]

                    frame_data = {
                        "frame_index": idx + 1,
                        "timestamp_str": time_str,
                        "timestamp_seconds": round(timestamp_sec, 2),
                        "frame_file": frame_filename,
                        "scene_note": narrative,
                        "detection_count": 2 + (idx % 3),
                        "confidence": conf
                    }
                    extracted_frames.append(frame_data)

                    timeline_events.append({
                        "timestamp_str": time_str,
                        "source_type": "video",
                        "title": f"Video Event ({time_str}): {title}",
                        "description": narrative,
                        "confidence": conf,
                        "tags": ["video_analysis", "temporal_detection", title.lower().replace(" ", "_")]
                    })

                cap.release()
        except Exception as e:
            print(f"[DemoEngine] OpenCV video error: {e}")

        summary = (
            f"Video analyzed ({duration_sec:.1f}s total duration, {fps:.1f} FPS). "
            f"Extracted and evaluated {len(extracted_frames)} keyframes across sequence. "
            "Chronological event progression reveals perimeter entry, breached access point, and rapid withdrawal."
        )

        scene_desc = (
            f"Multi-temporal CCTV analysis: Recorded at {width}x{height} resolution. "
            "Consistent tracking established across all sampled keyframes. "
            "Observed sequential activity correlating with unauthorized entry pattern."
        )

        risk_assessment = {
            "threat_level": "High",
            "duration_seconds": round(duration_sec, 1),
            "sampled_frames_count": len(extracted_frames),
            "critical_timestamps": [f["timestamp_str"] for f in extracted_frames if f["confidence"] > 0.85]
        }

        return {
            "analysis_mode": "demo",
            "model_used": "Forensic Demo Engine (OpenCV Temporal Frame Sampler)",
            "summary": summary,
            "scene_description": scene_desc,
            "detected_objects": [],
            "transcription": "",
            "audio_segments": [],
            "video_frames": extracted_frames,
            "risk_assessment": risk_assessment,
            "timeline_events": timeline_events,
            "is_simulated": True
        }

    @staticmethod
    def analyze_audio(file_path: str, filename: str) -> dict:
        """
        Forensic Audio Analysis in Demo Mode:
        Simulates speech recognition and acoustic event analysis with speaker diarization
        and timestamped utterances.
        """
        audio_segments = [
            {
                "id": "seg-1",
                "start": "00:00",
                "end": "00:04",
                "speaker": "Speaker 1 (Caller)",
                "text": "Control, we have an active perimeter breach at the east storage dock.",
                "confidence": 0.95,
                "sentiment": "Urgent / Stress Detected"
            },
            {
                "id": "seg-2",
                "start": "00:05",
                "end": "00:09",
                "speaker": "Speaker 2 (Dispatcher)",
                "text": "Copy that Unit 4. Confirm subject description and direction of travel.",
                "confidence": 0.97,
                "sentiment": "Neutral / Professional"
            },
            {
                "id": "seg-3",
                "start": "00:10",
                "end": "00:16",
                "speaker": "Speaker 1 (Caller)",
                "text": "Single individual, dark jacket and gloves. Moving towards the service alleyway. Dark sedan parked nearby.",
                "confidence": 0.92,
                "sentiment": "High Vigilance"
            },
            {
                "id": "seg-4",
                "start": "00:17",
                "end": "00:22",
                "speaker": "Speaker 2 (Dispatcher)",
                "text": "Patrol units 2 and 7 rerouted to intercept at Elm and 4th. Stand by.",
                "confidence": 0.96,
                "sentiment": "Directive"
            }
        ]

        full_transcription = " ".join([f"[{s['speaker']}]: {s['text']}" for s in audio_segments])

        timeline_events = [
            {
                "timestamp_str": seg["start"],
                "source_type": "audio",
                "title": f"Audio Transmission ({seg['start']}): {seg['speaker']}",
                "description": seg["text"],
                "confidence": seg["confidence"],
                "tags": ["audio_transcript", "radio_dispatch"]
            }
            for seg in audio_segments
        ]

        risk_assessment = {
            "threat_level": "Elevated",
            "acoustic_analysis": "Vocal stress markers present in Caller audio channel (+18dB pitch elevation)",
            "key_entities_extracted": ["east storage dock", "dark jacket", "dark sedan", "service alleyway", "Unit 4", "Unit 2 & 7"]
        }

        summary = (
            f"Forensic audio transcription completed. Identified 2 distinct speaker profiles across {len(audio_segments)} segments. "
            "Corroborates perimeter intrusion timing and subject physical description."
        )

        return {
            "analysis_mode": "demo",
            "model_used": "Forensic Demo Engine (Whisper Diarization Simulated)",
            "summary": summary,
            "scene_description": "Acoustic audio log: High signal-to-noise ratio, standard dispatch communications channel.",
            "detected_objects": [],
            "transcription": full_transcription,
            "audio_segments": audio_segments,
            "video_frames": [],
            "risk_assessment": risk_assessment,
            "timeline_events": timeline_events,
            "is_simulated": True
        }
