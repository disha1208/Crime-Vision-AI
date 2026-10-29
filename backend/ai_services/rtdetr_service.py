"""
RT-DETR (Real-Time Detection Transformer) Service Module.
Provides optional integration for deep learning object detection.
Falls back safely to Demo Engine if RT-DETR dependencies or weights are not installed.
"""

class RTDETRService:
    def __init__(self):
        self.model = None
        self.is_available = False
        self._check_availability()

    def _check_availability(self):
        try:
            # Check for Ultralytics RT-DETR support if present
            import ultralytics
            self.is_available = True
        except ImportError:
            self.is_available = False

    def get_status(self):
        return {
            "name": "RT-DETR (Real-Time Detection Transformer)",
            "available": self.is_available,
            "description": "State-of-the-art transformer object detector for high-precision forensic bounding boxes.",
            "status_message": "Ready" if self.is_available else "Not installed (Optional model). Using Demo Engine simulation."
        }

    def detect_objects(self, image_path: str):
        if not self.is_available:
            return {
                "success": False,
                "error": "RT-DETR model not installed. Switch to Demo Mode for simulated detection.",
                "detections": []
            }
        # In case ultralytics is installed in environment
        try:
            from ultralytics import RTDETR
            if self.model is None:
                self.model = RTDETR('rtdetr-l.pt')
            results = self.model(image_path)
            detections = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    b = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    label = r.names[cls_id]
                    detections.append({
                        "id": f"det-{len(detections)+1}",
                        "label": label,
                        "category": "Detected Object",
                        "confidence": round(conf, 3),
                        "bbox": [int(x) for x in b],
                        "attributes": {"model": "RT-DETR Real"}
                    })
            return {"success": True, "detections": detections, "is_simulated": False}
        except Exception as e:
            return {"success": False, "error": str(e), "detections": []}
