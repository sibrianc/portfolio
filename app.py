# app.py
import os
from flask import Flask, session, request, redirect, url_for, g  # add session, request, redirect, url_for
from dotenv import load_dotenv
load_dotenv()


from flask_bootstrap import Bootstrap5  # FIX: use Bootstrap5 class
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from models import db, User
import routes_public, routes_admin

def create_app() -> Flask:
    # --- Base config ---
    # NOTE: instance_relative_config lets you store the DB under ./instance/
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)

    app.config["SECRET_KEY"] = os.getenv("FLASK_KEY", "change-me")

    # NOTE: Force a stable absolute path for your sqlite DB under instance/
    db_path = os.path.join(app.instance_path, "portfolio.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DB_URI", f"sqlite:///{db_path}")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Debug print to confirm which DB you're using
    print("DB URI ->", app.config["SQLALCHEMY_DATABASE_URI"])

    # --- Extensions ---
    Bootstrap5(app)  # Use Bootstrap5 instead of Bootstrap for Bootstrap v5 support
    CSRFProtect(app)
    db.init_app(app)
    Migrate(app, db)

    # --- Login manager ---
    login_manager = LoginManager()
    login_manager.login_view = "admin_login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        # NOTE: SQLAlchemy 2.x style get
        return db.session.get(User, int(user_id))

    # --- Register routes ---
    routes_public.register(app)
    routes_admin.register(app)
    
    # --- Internationalization support ---
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

    # --- CLI: create admin from env vars ---
    @app.cli.command("create-admin")
    def create_admin():
        """Create or update an admin user from ENV variables."""
        from werkzeug.security import generate_password_hash
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
