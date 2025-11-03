# tests/test_admin_auth.py
import pytest
from conftest import login_as_admin_session

# Ajusta estas rutas a las que tengas en tu app:
LOGIN_ROUTE = "/super-secret-login"   # o "/admin/login"
ADMIN_HOME  = "/admin"                # dashboard admin

def test_admin_requires_login(client):
    """Visitar /admin sin sesión debe redirigir o bloquear."""
    resp = client.get(ADMIN_HOME, follow_redirects=False)
    assert resp.status_code in (302, 401, 403)

def test_admin_access_with_session(client):
    """Con sesión de admin debe dar 200."""
    login_as_admin_session(client)
    resp = client.get(ADMIN_HOME)
    assert resp.status_code == 200

def test_login_wrong_credentials_if_enabled(client):
    """
    Si ya tienes endpoint de login por POST,
    prueba credenciales malas.
    """
    # Si aún no lo tienes, puedes comentar este test
    data = {"email": "fake@example.com", "password": "wrong"}
    resp = client.post(LOGIN_ROUTE, data=data, follow_redirects=False)
    assert resp.status_code in (200, 400, 401, 403)
