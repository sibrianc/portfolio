# app.py
import os
from datetime import timedelta
from flask import Flask, session, request, g
from dotenv import load_dotenv

load_dotenv()

from flask_bootstrap import Bootstrap5
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from models import db, User
import routes_public, routes_admin

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

def create_app() -> Flask:
    # --- Base config ---
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)

    app.config["SECRET_KEY"] = os.getenv("FLASK_KEY", "change-me")

    # DB Config
    db_path = os.path.join(app.instance_path, "portfolio.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DB_URI", f"sqlite:///{db_path}")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --- SEGURIDAD DE SESIÓN ---
    # 1. La sesión muere al cerrar el navegador
    app.config["SESSION_PERMANENT"] = False 
    # 2. La sesión expira tras 30 minutos de inactividad
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
    # 3. Cookie segura (solo se envía si es HTTPS, desactívalo si pruebas en local sin SSL)
    app.config["SESSION_COOKIE_SECURE"] = False # Pon True en producción con HTTPS
    app.config["SESSION_COOKIE_HTTPONLY"] = True # Evita robo por JavaScript

    print("DB URI ->", app.config["SQLALCHEMY_DATABASE_URI"])

    # --- Extensions ---
    Bootstrap5(app)
    CSRFProtect(app)
    db.init_app(app)
    Migrate(app, db)
    
    # Rate Limiter
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        storage_uri="memory://",
        default_limits=["200 per day", "50 per hour"]
    )

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
    
    # --- Internationalization ---
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

    # --- CLI: create admin ---
    @app.cli.command("create-admin")
    def create_admin():
        """Create or update an admin user from ENV variables."""
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

    # --- ANTI-CACHÉ PARA ADMIN (La solución a tu problema visual) ---
    @app.after_request
    def add_security_headers(response):
        # 1. Protección Anti-Caché para Admin (Ya la tenías)
        if request.path.startswith("/admin"):
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        # 2. Protección Global (NUEVO)
        # X-Content-Type-Options: Evita que el navegador adivine el tipo MIME (seguridad básica)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        # X-Frame-Options: Evita que tu web sea incrustada en iframes (anti-clickjacking)
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        # Strict-Transport-Security: Fuerza HTTPS (Solo activar si usas HTTPS/SSL)
        # response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5002)