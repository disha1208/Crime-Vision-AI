from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        # Ensure directories exist
        app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
        app.config['FRAMES_FOLDER'].mkdir(parents=True, exist_ok=True)
        app.config['REPORTS_FOLDER'].mkdir(parents=True, exist_ok=True)
        db.create_all()
