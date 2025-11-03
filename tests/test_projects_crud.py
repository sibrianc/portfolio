# tests/test_projects_crud.py
from conftest import login_as_admin_session

# Ajusta estas rutas a las reales en tu app:
ADMIN_NEW_PROJECT = "/admin/projects/new"
ADMIN_LIST        = "/admin"  # o "/admin/projects"

def test_create_project_minimal(client):
    """Crear un proyecto vía POST (sin depender de HTML)."""
    login_as_admin_session(client)

    payload = {
        "title": "Test Project",
        "slug": "test-project",
        "description": "Proyecto de prueba",
        "tech": "Flask, Bootstrap",
        "repo_url": "https://github.com/tuuser/tu-repo",
        "live_url": "https://example.com",
        # agrega los nombres exactos que tu formulario espera
    }

    resp = client.post(ADMIN_NEW_PROJECT, data=payload, follow_redirects=False)
    # Normalmente los formularios bien hechos responden 302 a una lista/detalle
    assert resp.status_code in (200, 201, 302)

    # Opcional: luego pedimos el listado para confirmar que la página carga
    follow = client.get(ADMIN_LIST)
    assert follow.status_code == 200
