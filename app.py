# app.py
import os
from flask import Flask, session, request, redirect, url_for, g  # add session, request, redirect, url_for

from flask_bootstrap import Bootstrap5  # FIX: use Bootstrap5 class
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from models import db, User
import routes_public, routes_admin
from flask_mail import Mail, Message # Import Flask-Mail

# Rate limiting (optional)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address



def create_app() -> Flask:
    # --- Load environment variables ---
    from dotenv import load_dotenv
    load_dotenv()  # Read .env file

    # --- Create base app ---
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)
    
    

    # --- Basic configuration ---
    app.config["SECRET_KEY"] = os.getenv("FLASK_KEY", "change-me")
    
    # --- Rate limiting (anti-bruteforce) ---
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=[]
    )
    # optional: store a reference accessible from routes_admin.py
    app.extensions['limiter'] = limiter

    # --- Database ---
    db_path = os.path.join(app.instance_path, "portfolio.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DB_URI", f"sqlite:///{db_path}")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # suprime warning de SQLAlchemy

    # --- Email (Flask-Mail) ---
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "587"))
    app.config["MAIL_USE_TLS"] = bool(int(os.getenv("MAIL_USE_TLS", "1")))
    app.config["MAIL_USE_SSL"] = bool(int(os.getenv("MAIL_USE_SSL", "0")))
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
    app.config["CONTACT_RECIPIENT"] = os.getenv("CONTACT_RECIPIENT")

    # --- Debugging ---
    print("DB URI ->", app.config["SQLALCHEMY_DATABASE_URI"])

    # -- Extensions ---
    Bootstrap5(app)
    CSRFProtect(app)
    db.init_app(app)
    Migrate(app, db)
    mail = Mail(app)    # Initialize Flask-Mail

    # --- Login manager ---
    login_manager = LoginManager()
    login_manager.login_view = "admin_login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # --- Register routes ---
    routes_public.register(app)
    routes_admin.register(app)

    # --- Language switcher ---
    translations = {
        'en': {
            'brand_left': 'CARLOS',
            'brand_right': '_SIBRIAN',
            'home': 'Home',
            'about': 'About',
            'projects': 'Projects',
            'contact': 'Contact',
            'cta': 'Contact Me',
            'hero_tagline': 'Developer building modern web experiences with Flask, Bootstrap and JS.',
            'form_name' : 'Name',
            'form_email': 'Email',
            'form_message': 'Message',
            'form_send': 'Send',
            'contact_success': 'Thank you! Your message was sent successfully.',
        },
        'es': {
            'brand_left': 'CARLOS',
            'brand_right': '_SIBRIAN',
            'home': 'Inicio',
            'about': 'Sobre mí',
            'projects': 'Proyectos',
            'contact': 'Contacto',
            'cta': 'Contáctame',
            'hero_tagline': 'Desarrollador creando experiencias web modernas con Flask, Bootstrap y JS.',
            'form_name': 'Nombre',
            'form_email': 'Correo',
            'form_message': 'Mensaje',
            'form_send': 'Enviar',
            'contact_success': '¡Gracias! Tu mensaje fue enviado correctamente.'
        }
    }

    @app.context_processor
    def inject_lang():
        def current_lang():
            return session.get('lang', 'en')
        def t(key):
            lang = session.get('lang', 'en')
            return translations.get(lang, {}).get(key, key)
        return {'current_lang': current_lang, 't': t}

    # --- CLI commands ---
    @app.cli.command("create-admin")
    def create_admin():
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")
        name = os.getenv("ADMIN_NAME", "Admin")
        if not email or not password:
            print("Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment.")
            return
        user = db.session.execute(db.select(User).where(User.email == email)).scalar()
        if not user:
            user = User(email=email, name=name, is_admin=True)
            user.set_password(password)
            db.session.add(user)
        else:
            user.is_admin = True
            user.set_password(password)
        db.session.commit()
        print(f"Admin ready: {email}")

    return app


# Development entrypoint
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5002)
