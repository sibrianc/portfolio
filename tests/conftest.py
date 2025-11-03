# tests/conftest.py
import os
import sys
import importlib
from pathlib import Path

import pytest
from flask import Flask

# --- Asegurar que el root del proyecto está en sys.path (maneja espacios en Windows) ---
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def _load_flask_app() -> Flask:
    """
    Intenta:
      1) cargar 'app' desde app.py (instancia global)
      2) llamar a create_app(**kwargs) si existe
    """
    mod = importlib.import_module("app")

    # 1) ¿hay instancia global 'app'?
    maybe_app = getattr(mod, "app", None)
    if isinstance(maybe_app, Flask):
        return maybe_app

    # 2) ¿hay factory create_app?
    create_app = getattr(mod, "create_app", None)
    if callable(create_app):
        # Variables de entorno útiles para tu config
        os.environ.setdefault("FLASK_ENV", "testing")
        os.environ["TESTING"] = "1"
        os.environ.setdefault("SECRET_KEY", "test-secret")

        # DB temporal para tests (en instance/)
        instance_dir = PROJECT_ROOT / "instance"
        instance_dir.mkdir(exist_ok=True)
        test_db_path = instance_dir / "test.db"

        # Intenta respetar tu config actual (si lees DATABASE_URL o SQLALCHEMY_DATABASE_URI)
        os.environ.setdefault("DATABASE_URL", f"sqlite:///{test_db_path}")
        os.environ.setdefault("SQLALCHEMY_DATABASE_URI", f"sqlite:///{test_db_path}")

        app = create_app(testing=True) if "testing" in create_app.__code__.co_varnames else create_app()
        # Forzar banderas de testeo
        app.config.update(
            TESTING=True,
            WTF_CSRF_ENABLED=False,
            SQLALCHEMY_DATABASE_URI=os.environ.get("SQLALCHEMY_DATABASE_URI", f"sqlite:///{test_db_path}"),
        )
        return app

    raise RuntimeError(
        "No encontré ni una instancia 'app' ni una factory 'create_app()' en app.py. "
        "Define 'app = Flask(__name__)' o 'def create_app(...): return app'."
    )

@pytest.fixture(scope="session")
def app():
    application = _load_flask_app()
    yield application

@pytest.fixture()
def client(app):
    return app.test_client()

# (Opcional) helper para loguearte como admin si ya tienes ruta /admin/login
@pytest.fixture()
def login_as_admin_session(client):
    def _login(username="admin", password="admin123"):
        return client.post("/admin/login", data={"username": username, "password": password}, follow_redirects=True)
    return _login
