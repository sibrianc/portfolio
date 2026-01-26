def test_home(client):
    response = client.get("/")
    assert response.status_code == 200

def test_about(client):
    response = client.get("/about")
    assert response.status_code == 200

def test_projects(client):
    response = client.get("/projects")
    assert response.status_code == 200

def test_contact(client):
    response = client.get("/contact")
    assert response.status_code == 200

def test_admin_login_page(client):
    # Default path is /admin/login
    response = client.get("/admin/login")
    assert response.status_code == 200
