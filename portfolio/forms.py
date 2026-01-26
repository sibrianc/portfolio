# forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email, Length

# Contact form for public users
class ContactForm(FlaskForm):
    # NOTE: Basic contact form for public users
    name = StringField("form_name", validators=[DataRequired(), Length(max=120)])
    email = StringField("form_email", validators=[DataRequired(), Email(), Length(max=240)])
    message = TextAreaField("form_message", validators=[DataRequired(), Length(max=2000)])
    
    # --- TRAMPA PARA BOTS (Honeypot) ---
    # Este campo estará oculto en el HTML. 
    # Los humanos no lo ven, pero los bots sí y lo llenarán.
    # Si llega con datos al servidor, sabremos que es spam.
    bot_catcher = StringField('Nick') 

    submit = SubmitField("form_send")

# Admin login form
class AdminLoginForm(FlaskForm):
    # NOTE: Admin-only login form
    email = StringField("Email", 
                        validators=[DataRequired(), Email()],
                        # Le decimos al navegador que no autocomplete este campo
                        render_kw={"autocomplete": "off"})
    
    password = PasswordField("Password", 
                             validators=[DataRequired()],
                             # "new-password" es el truco para que no sugiera claves viejas
                             render_kw={"autocomplete": "new-password"})
    
    submit = SubmitField("Log In")

# Admin project form for creating/editing projects
class ProjectForm(FlaskForm):
    # NOTE: Admin project CRUD form with bilingual support
    # English fields
    title = StringField("Title (English)", validators=[DataRequired(), Length(max=120)])
    slug = StringField("Slug", validators=[DataRequired(), Length(max=140)])
    summary = StringField("Summary (English)", validators=[Length(max=280)])
    description = TextAreaField("Description (English)")
    
    # Spanish fields
    title_es = StringField("Título (Español)", validators=[Length(max=120)])
    summary_es = StringField("Resumen (Español)", validators=[Length(max=280)])
    description_es = TextAreaField("Descripción (Español)")
    
    # Language-agnostic fields
    tech_stack = StringField("Tech stack (CSV)", validators=[Length(max=240)])
    repo_url = StringField("Repo URL")
    live_url = StringField("Live URL")
    cover_image = StringField("Cover image URL", validators=[Length(max=240)])
    video_url = StringField("Video URL", validators=[Length(max=240)])
    is_featured = BooleanField("Featured")
    submit = SubmitField("Save")